const SHOPS = [
  {
    name: "Decathlon",
    icon: "https://www.decathlon.es/render/android-icon-192x192.47c610ae67c1b1bdc694.png",
    domain: "www.decathlon.es",
    sitemaps: [
      "https://www.decathlon.es/sitemap/product-0.xml",
      "https://www.decathlon.es/sitemap/mp-product-0.xml",
      "https://www.decathlon.es/sitemap/mp-product-1.xml",
    ],
  },
  // No keywords in url
  // {
  //   name: "H&M",
  //   icon: "https://www2.hm.com/etc.clientlibs/settings/wcm/designs/hm/clientlibs/shared/resources/favicon/favicon.ico",
  //   domain: "www2.hm.com",
  //   sitemapWhitelist: ["es_es.product", "es_es.sitemap"],
  // },
  {
    name: "Asos",
    icon: "https://www.asos.com/favicon-32x32.png",
    domain: "www.asos.com",
    sitemapWhitelist: ["product-sitemap-index-ES", "product-sitemap-es"],
  },
  {
    name: "Primark",
    icon: "https://www.primark.com/favicon.ico",
    domain: "www.primark.com",
    sitemaps: [
      "https://www.primark.com/es-es/sitemap/sitemap-products.xml",
    ],
  },
  {
    name: "Springfield",
    icon: "https://myspringfield.com/on/demandware.static/Sites-SPF-Site/-/default/dw531e4368/img/favicon/favicon-96x96.png",
    domain: "myspringfield.com",
    sitemaps: [
      "https://myspringfield.com/on/demandware.store/Sites-SPF-Site/es_ES/SiteMapCustom-Google?name=sitemap_1-Products%2exml",
      "https://myspringfield.com/on/demandware.store/Sites-SPF-Site/es_ES/SiteMapCustom-Google?name=sitemap_4-Products%2exml",
      "https://myspringfield.com/on/demandware.store/Sites-SPF-Site/es_ES/SiteMapCustom-Google?name=sitemap_6-Products%2exml",
    ],
  },
  {
    name: "Nike",
    icon: "https://www.nike.com/android-icon-192x192.png",
    domain: "www.nike.com",
    sitemaps: [
      "https://www.nike.com/sitemap-v2-pdp-es-es.xml",
    ],
  },
  {
    name: "Levi's",
    icon: "https://www.levi.com/ngsa/img/corpLogos/LevisLogo.png",
    domain: "www.levi.com",
    sitemapWhitelist: ["ES/en/sitemap.xml", "Product-es-ES-EUR"],
  },
  {
    name: "JD Sports",
    icon: "https://www.jdsports.es/skins/jdsports-desktop/public/img/icons/app/favicon.ico",
    domain: "www.jdsports.es",
    sitemaps: [
      "https://www.jdsports.es/sitemaps/es-es_desktop_product_0.xml",
    ],
  },
  {
    name: "Decimas",
    icon: "https://www.decimas.com/static/favicon.ico",
    domain: "www.decimas.com",
    sitemaps: [
      "https://www.decimas.com/sitemap.xml",
    ],
  },
  {
    name: "Cortefiel",
    icon: "https://cortefiel.com/on/demandware.static/Sites-CTF-Site/-/default/dw9250384f/img/favicon/favicon-96x96.png",
    domain: "cortefiel.com",
    sitemaps: [
      "https://cortefiel.com/on/demandware.store/Sites-CTF-Site/es_ES/SiteMapCustom-Google?name=sitemap_1-Products%2exml",
      "https://cortefiel.com/on/demandware.store/Sites-CTF-Site/es_ES/SiteMapCustom-Google?name=sitemap_4-Products%2exml",
    ],
  },
  {
    name: "Algo Bonito",
    icon: "https://algo-bonito.com/cdn/shop/files/logo_32x32.png",
    domain: "algo-bonito.com",
    sitemaps: [
      "https://algo-bonito.com/sitemap_products_1.xml?from=6818502410406&to=8632545083726",
    ],
  },
  
  // og only
  // deportesmoya.es
  // www.barrabes.com
  // shop.mango.com
  // pepco.es
  // www.thenorthface.es
  // www.valecuatro.com
  
  // Sitemap is compressed
  // {
  //   name: "Bershka",
  //   icon: "https://www.bershka.com/favicons/android-chrome-192x192.png",
  //   domain: "www.bershka.com",
  // },
  // Sitemap is compressed
  // {
  //   name: "Stradivarius",
  //   icon: "https://www.stradivarius.com/front/static/itxwebstandard/images/favicon-32x32.png",
  //   domain: "www.stradivarius.com",
  // },
  // Very aggresive captcha
  // {
  //   name: "Shein",
  //   icon: "https://sheinsz.ltwebstatic.com/she_dist/images/touch-icon-ipad-144-47ceee2d97.png",
  //   domain: "es.shein.com",
  // },
  // No sitemap in robots.txt
  // {
  //   name: "Zalando",
  //   icon: "https://mosaic02.ztat.net/rnd/ng/zalando-app-touch-icon-180-v1.png",
  //   domain: "www.zalando.es",
  // },
  // Sitemap is compressed
  // {
  //   name: "Zara",
  //   icon: "https://static.zara.net/stdstatic/5.20.0//images/favicon-32x32.png",
  //   domain: "www.zara.com",
  // },
  // "nil" robots.txt
  // {
  //   name: "Miravia",
  //   icon: "https://img.mrvcdn.com/us/media/7bada92e11dd275f27772c5ee02194ae.png",
  //   domain: "www.miravia.es",
  // }
  // www.c-and-a.com/ // no robots.txt
  // www.in-gravity.com // no jsonld no og
  // www.amazon.es // sitemap is compressed
  // www.sfera.com // no jsonld no good og
]

module.exports = SHOPS
