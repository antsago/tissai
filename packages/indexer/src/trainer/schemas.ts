import {
  Compiler,
  Required,
  Lexer,
  Schema,
  Type,
} from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LLM, Property } from "./LlmLabeler/index.js"
import { extractSchemas } from "./extractSchemas.js"
import { getFirstWord } from "./getFirstWord.js"
import { getCategory } from "./getCategory.js"

export const ProductType = Symbol("Product")

const getPrompt = (title: string, properties: Property[]) => {
  const labeled = properties.map(p => `${p.value} <> ${p.labels[0]}`).join("\n    ").slice(0, -1)

  return `Dados los nombres de los productos siguientes, etiqueta cada palabra con el nombre de los atributos que representa:
  Conjunto de cazadora y pantalón | Total look de hombre | SPF
    Conjunto <> categoría
    cazadora <> categoría
    pantalón <> categoría
    Total <> modelo
    look <> modelo
    hombre <> género
    SPF <> marca

  Fred Perry Classic Swim Pantalones cortos
    Fred <> marca
    Perry <> marca
    Classic <> modelo
    Swim <> modelo
    Pantalones <> categoría
    cortos <> largo

  PANTALÓN PITILLO CON CREMALLERA BALONCESTO ADULTO
    PANTALÓN <> categoría
    PITILLO <> talle
    CREMALLERA <> cremallera
    BALONCESTO <> deporte
    ADULTO <> edad

  Pantalón térmico interior de esqui y nieve Mujer SWIX Race
    Pantalón <> categoría
    térmico <> térmico
    interior <> interior
    esqui <> deporte
    nieve <> deporte
    Mujer <> género
    SWIX <> marca
    Race <> modelo

  ${title}
    ${labeled}`
}

const getLabels = async (llm: LLM, title: string, previousProperties: Property[], currentWord: string): Promise<Property[]> => {
  const prompt = getPrompt(title, [...previousProperties, { value: currentWord, labels: [""] }])

  const output = await llm.send({
        prompt,
        options: {
          max_new_tokens:5,
          return_full_text:false,
          do_sample:false,
          num_beams:3,
          num_beam_groups:3,
          diversity_penalty:9.99,
          num_return_sequences:3,
        }
    }
    )

    const labels = output.map(o => getFirstWord(o)).filter(l => !!l) as string[]

    return [...previousProperties, { value: currentWord, labels }]
}

const getProperties = async (llm: LLM, title: string, words: string[]) => {
  return words.reduce(
    async (previousProperties: Promise<Property[]>, currentWord: string) =>
      getLabels(llm, title, await previousProperties, currentWord),
    Promise.resolve([]),
  )
}

const getSchemas =
  (llm: LLM) =>
  (lexer: Lexer): Schema[] => [
    {
      [Type]: ProductType,
      [Required]: {
        key: "@type",
        value: "Product",
      },
      title: {
        name: "name",
        parse: {
          as: "schemas",
          with: async (title: string) => {
            const words = await lexer.fromText(title)
            const category = await getCategory(llm, title)

            if (!category) {
              throw new Error("No category detected")
            }

            const properties = await getProperties(llm, title, words.map(w => w.text))

            const schemas = extractSchemas(category, properties)

            if (!schemas.find(s => s.label === "categoría")) {
              throw new Error("No property categoría found")
            }

            return schemas
          },
        },
      },
    },
  ]

export const compilerFixture = (reporter: Reporter) => {
  const llm = LLM(reporter)
  const compiler = Compiler(getSchemas(llm))
  return [
    compiler,
    () => Promise.all([compiler?.close(), llm?.close()]),
  ] as const
}
