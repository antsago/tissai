import robotsParser from "robots-parser"
import { Db } from "./Db.js"
import { Cache } from "./Cache.js"

const CACHE_FOLDER = process.argv[2]
const cache = Cache(CACHE_FOLDER)
const db = Db()

const site = (await db.query("SELECT * FROM sites"))[0]

const robotsResponse = await cache.get(`https://${site.domain}/robots.txt`)
const robots = robotsParser(robotsResponse.url, robotsResponse.body)
const sitemaps = robots.getSitemaps()

db.query(sitemaps[0])