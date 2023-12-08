const { setTimeout } = require("timers/promises")
const { writeFile, appendFile, readdir, readFile } = require("fs/promises")
const { createHash } = require("node:crypto")

const Semaphore = function (crawlDelay) {
  const queue = []

  let timeout
  const start = () => {
    if (!queue.length) {
      return
    }

    const [next] = queue.splice(0, 1)
    timeout = setTimeout(crawlDelay).then(() => {
      timeout = undefined
      start()
    })

    next()
  }

  return async function waitForGreen() {
    const lock = new Promise((res) => queue.push(res))

    if (!timeout) {
      start()
    }

    return lock
  }
}

const MAX_PATH_LENGTH = 150
const encodePath = (url) => {
  const encoded = encodeURIComponent(url)

  if (encoded.length <= MAX_PATH_LENGTH) {
    return encoded
  }

  const pruned = encoded.slice(0, MAX_PATH_LENGTH)
  const trim = encoded.slice(MAX_PATH_LENGTH)
  const checksum = createHash("md5").update(trim).digest("hex")
  return `${pruned}${checksum}`
}

const Fetcher = function (productToken, loggingPath, crawlDelay) {
  const waitForGreen = Semaphore(crawlDelay)

  const retrieveFromSrc = async (url) => {
    await waitForGreen()
    const response = await fetch(url, { headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      ["Accept-Language"]: "fr,en;q=0.9,es;q=0.8,en-GB;q=0.7,fr-FR;q=0.6,ja;q=0.5",
      Cookie: "cookieId=6200E39D_0266_2714_3520_59634EE84B38; sessionID_shein=s%3Af6Lz2_eUhHho2lwSkWRdu1TK1j4veARS.X3k6zSrlHuIg1arViwkK9bdqeKUl0reZsEWUyEk04%2FE; bm_sz=79ADCB130B5015A8E6AB5599C19A8350~YAAQK3R7XFr+LheMAQAA2dS4PhZOdwuEJFXtFmie6OnZct+SxYnU7SRxYjFRhb/9vCx2qmLKFBKqrkzJrT7mUnvRjzdPPZCPz+Dm+Jy9oeTGCVvYpk1olpKWMjKjcKjt1xgTlRC1X5PP4uqE1IuSTIxKqMXhjUE1WbMBZ5vT1IMdpqGs4PvmiXIAHfAqzHnDneccB0wBktE/yKkrIO1NtpL7tZy2ui1n8oda7rHga7P8hfIAeva61BCUwxPRuXiLLykD3iVlcu4eY+l5tjrQeQXHv7+LtBgWUQEVtHQLNAW+7w==~3425329~3551301; RESOURCE_ADAPT_WEBP=1; country=ES; countryId=198; _pin_unauth=dWlkPU5EYzVZMk0zTWpndE1UTmpOQzAwWkRReUxUaGhOREV0Tnpsa1lXRTBORGM0WkRjMA; _csrf=hzCeDGd3QciZhXP-UHPKCEBV; ftr_blst_1h=1701862433920; lastRskxRun=1701862434040; rskxRunCookie=0; rCookie=b5udcje5na5woguw1l8c9llptoyad4; forterToken=42d133c6f15443d491f61d72e205b108_1701862433532__UDF43-m4_17ck; bm_mi=921E655E673CF3DE571BC1B8293BAB08~YAAQJXR7XACesCSMAQAAl//nPhbOZkhodT6MbhdIIdc+sLIzl+IA9nq2EZmOAFyUPCNQrybD6NvG9SdLkOOZZrWYNma9JUU0ROU57IzeUPnJlAU5heZ+7VvxpasjGZjOxoFcmj1jmA48vPwcoiWdA0l21olcmO7nmuBS0LP3fY74+Mg9fexZ5V8kd5yXtmbFMehHPeUI1ag0r60gzW06oXsHAOkU1JzmkAKavJmE1Pu2faUbTtbUDnGp8D4hMqYjFE6Yg0p+7K0FSBIsjj0LjkULFuboZdVcUfuxSMg9xVb7KfyWJL6EvZWp60FBzDCzURVK80vGDwPHWhfcYMzzWNB/1Bs=~1; bm_sv=842128C02E772A23CCC97D617DE24F02~YAAQJXR7XAGesCSMAQAAl//nPhbHxsbpFCsOvgHrksL14nYvJBpE1sOUKYpnkFR6+JkjHzUS5n79TdRNXhE/khy4hyPVUtZyEL+aPobiuqV6WHFSVQvohJi8rS/y+YNaWZmP4FjhQjBMH5R1IoLeQFhD4vZ5iWcPiL2g+Zx2r2FqwoG9qw46M18CkmqE+Ajh8ph0A2Qgl0bnaZgyuTaP3RaEg/MUIwR6ypMGI+9EkRaLl9RTxf1Sg2/2KNpGkU+v~1; _abck=973186AB5D190F63FA1802430B981748~-1~YAAQJXR7XDyesCSMAQAAEQHoPgv0K8bQqHR1ZPOusatTyLZEDls9i8eL1W735c6E+ZhfUKeN65gKe0Upa/w2WX1zDk0ej/ypN8iyXHFXwYkHd7y5GG/qRqY4udpO4d2ZwixDtwaK7oyPZnnv7BoD+Qvxce2i2DvEahhU8/9mPddjODQ35dAYhbzgI2FW1qOcHJ4YQuLt7JszSoLiRvaf0ssU+9zXPX0vkia7eqUG77+Y4HxQDI9VTGk4ufWAYPwvXsdON/rITxDsz7A1gV7JICtB9KkKcSRLdOM3lnMD6dG0l1ZbNGFubIYr+xAIGw8EayJJtWIfnSxumnichSs3n6mPdh9y/cf/7dgE02sae8D0B6dXewF6b+g/dZRXgbVjW1+hNaxizNeJ~-1~-1~-1; ak_bmsc=193CDAFF5FC3E9916805E1B23CEC7602~000000000000000000000000000000~YAAQJXR7XJ2xsCSMAQAAwlDoPhY4RQzJEo8ItwUfzxcpbxCOw0PfLJG0dkPMHo4coSY2axKMVIa4QuN0TN1ZcMivvFwzVRkbnMVWzbNcpc4FGJjgJ/eToR+nmX5lTxm/s4KPyXuqEHFAcg5LU8ZIDUJMKCsrX54uezREfWs7rHj6VRUvcxET1faRvLb+ScWerI0KZJZ25IMQBY5cwREiOsB66BJh6hNW9bJFXf8VyyZI1+C4KbJqkXEBOuTHj9WCQLSBR9bT8J1QXTc8QrehppboWX7+SNiwafCSxHI1UPd3OulqVkbtE3hsyHqLPJnZI9pG8689q7NmasoeuHDkhBDqeC1y7/+ZrwMxMx9ftAv/ctDWn2uS3ZA1lQ1Ofd5XYkkdaQsG2FRBBAArH97wGSpFb4doq+meHNqrZxzAv2uJ1p0hRU7lWCROyURUziy+GQT8CWjzrhxaMeRmUCH8+7KjnzxpQ45YUMDVpBGGDFFtXtwJI9kbFm9T8q7NfeBWEzZpfEYD52kYdGqg6M/Qu+zFIzOpKKjoQasfqrjUZP7wgdtqsjnwFMAE; _f_c_llbs_=K1901_1701863207_pdek-qKi4XqxOFfpxE8dgLPEMgX4g17iHLwyjeua2zcTxB_uiyOhh4xjEbZd8oz7E31OYKzImnxLplsdFYIxpwFMdDqopH56zz7eMldHpN5FETYSTTEXEiEj09VJthK0WbQj3ydMXlCDi1PGCQXiceipdKFvhxJtBe378k-s-CIUPGp9bAL61BSmHb0keBEXXBM1_YJRnJ1Jw6m16uTa6B47S_ZR-M6wNn2X8GmFe7WsdgDmDYMaEmZjpyXWOiW_cSkUKRhyLUtVzZ_svpWtcaPQx2v8mqSrjkZm-IYp4LByod1f38L3U0LifILxBv6cjJT4bDTOm7GYnuw3pFE2mg; OptanonConsent=isIABGlobal=false&datestamp=Wed+Dec+06+2023+12%3A49%3A02+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=6.13.0&hosts=&consentId=74bd4fa6-2577-4006-bd85-f1e31e58df08&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0&AwaitingReconsent=false; __cf_bm=QDnkdmkj7BurxTeMJt8lLDVH6ScwfhYevFbXSTIk0P4-1701864423-0-AZBGQ8hudo9ndBCdXP8KE/S6o+rNAr/tvdo8fbWS+U5Am6XfzIxpBq6xB9jDwz6bQD3+NqcntM8fVeXnZixLWSM=; _cfuvid=m0NWxuN6hP31Y6N2W8U3pMW8.zMMztTxX4_aVoSQDCc-1701864423911-0-604800000; cf_clearance=YWsif2RK6NgniBUk3ffbpTuXsZoBQhi4WqJ6iboR1xQ-1701864424-0-1-559800a3.f0389547.2995f43-0.2.1701864424",
      Dnt: 1,
      ["Sec-Ch-Ua"]: '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      ["Sec-Ch-Ua-Mobile"]: "?0",
      ["Sec-Ch-Ua-Platform"]: '"macOS"',
      ["Sec-Fetch-Dest"]: "document",
      ["Sec-Fetch-Mode"]: "navigate",
      ["Sec-Fetch-Site"]: "same-origin",
      ["Sec-Fetch-User"]: "?1",
      ["Upgrade-Insecure-Requests"]: 1,
      ["User-Agent"]: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    } })

    return {
      url: response.url,
      status: response.status,
      body: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
    }
  }

  return async (url) => {
    try {
      const cachedResponses = (await readdir(loggingPath)).sort().reverse()
      const encodedUrl = encodePath(url)
      const cached = cachedResponses.filter((res) => res.includes(encodedUrl))
      if (cached.length) {
        const result = await readFile(`${loggingPath}/${cached[0]}`, {
          encoding: "utf8",
        })
        return JSON.parse(result)
      }

      const result = await retrieveFromSrc(url)

      await writeFile(
        `${loggingPath}/${Date.now()}@${encodedUrl}`,
        JSON.stringify(result),
      )

      return result
    } catch (err) {
      await appendFile(
        `${loggingPath}/errors.log`,
        `${JSON.stringify({
          timestamp: Date.now(),
          url,
          message: err.message,
        })}\n`,
      )
      throw err
    }
  }
}

module.exports = Fetcher
