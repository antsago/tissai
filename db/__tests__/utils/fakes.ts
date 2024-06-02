export const SITE = {
  id: "59a20ba8-1c4f-40a1-8483-939315ccf0b6",
  name: "Test",
  icon: "https://example.com/favicon.ico",
  domain: "example.com",
}

export const PAGE = {
  id: "4fd6e0ea-8c16-4ca5-b171-7db323b7025f",
  url: "https://example.com/page.html",
  site: SITE.id,
  body: "<html><head></head></html>",
}

export const BRAND = {
  name: "test",
  logo: "https://example.com/brand.jpg",
}

export const CATEGORY = {
  name: "test",
}

export const TAG = {
  name: "product",
}

export const EMBEDDING_FROM_PG =
  "[-0.036469363,0.0050473986,-0.024768546,-0.022758009,0.048654705,-0.01648343,0.113117754,0.0756732,-0.016206104,-0.02784625,0.05845852,-0.04573055,0.025223976,0.035567954,-0.009484698,-0.0033181657,0.04162702,0.011296203,-0.07304241,-0.037542924,0.025124315,-0.04515887,0.015159564,0.072019346,-0.07230935,0.0440157,-0.0042102984,-0.02153088,0.040124007,-0.07771352,0.049893223,-0.007674926,-0.004400105,0.0034948462,0.078671016,-0.025991384,0.006716032,-0.0044259755,-0.03546691,0.024234919,0.032178022,-0.13978314,-0.031138694,0.019210594,0.011876059,0.008059251,0.034164816,0.07609215,0.013357675,0.011932107,-0.05078683,-0.039976165,-0.08221587,-0.04798498,-0.05305677,-0.055534534,0.01276216,-0.030991076,0.0129219,0.050495442,0.0352634,-0.07891973,-0.0404474,0.05083705,0.044174206,0.0045091305,-0.012550882,-0.03554432,-0.05494195,-0.024960907,-0.021507068,-0.003447463,-0.005756784,0.064762235,0.02712243,0.042196438,0.008091495,-0.1211637,0.070211716,-0.0075026425,-0.08357884,-0.05576448,-0.041643348,0.06180762,0.05662966,0.10291767,0.06725727,0.039719447,-0.060359884,-0.007948657,0.00922511,0.054087397,-0.038945243,-0.015152319,-0.060936842,0.02148501,0.030049251,-0.065470845,0.05389813,0.16600417,0.01475436,-0.038350444,0.009719799,-0.08955301,-0.11394317,-0.038309027,-0.004946871,-0.08647606,0.118832484,0.08197433,-0.067126796,-0.019493137,-0.032385215,0.053914104,-0.025517926,-0.042907592,-0.068053745,0.023558639,-0.06359977,-0.011178354,0.07359453,0.026921617,0.054067332,-0.020375757,-0.005996762,0.049616892,0.08173114,-3.459786e-33,-0.046430666,-0.0666255,0.05143131,0.08972503,-0.056035325,0.05784251,-0.0029652193,0.081673965,-0.007321375,0.04849614,-0.005021058,-0.0016855133,-0.015257526,0.044099774,0.06540972,0.0782842,-0.0051647243,-0.007571488,0.0068642525,0.008050913,-0.038368445,-0.048144702,-0.012195915,0.019026129,-0.047227763,-0.079711154,-0.00029520097,0.021419622,0.014543819,0.010480833,-0.02242897,0.013940699,-0.06848571,-0.005095295,-0.06376932,0.049510244,-0.030952595,-0.06535278,0.036895502,0.038332544,-0.00901022,-0.035340548,0.056938097,0.050849754,0.042342253,-0.049458966,-0.0599261,-0.019456908,0.05469682,0.0051094512,-0.053981893,0.03901567,-0.00079188286,-0.05916249,-0.047848918,0.010942044,-0.016118374,-0.039812207,0.05203749,0.09189212,-0.06758386,0.08719968,0.0060779834,0.04718934,-0.10767634,-0.0021016437,-0.00033683903,-0.10018099,0.043001477,0.063142434,-0.000595026,-0.00956524,0.039228205,-0.012972672,-0.0032090745,-0.043992337,0.0061249426,0.072732285,-0.019481821,-0.06056996,0.07370141,-0.0580071,0.015118339,-0.0020397177,-0.042758644,-0.037689086,-0.069008626,-0.06876305,-0.025625011,-0.035215374,0.008948769,0.03426872,-0.043377765,0.032003857,0.07072197,2.3297888e-33,-0.06521512,-0.013381383,0.019165486,0.08542518,0.09342751,-0.03928591,0.050045233,-0.06243828,-0.02104878,0.10981565,0.06972208,-0.057949312,0.03075554,0.0008381112,-0.06906922,0.10400422,0.045025952,-0.04496989,0.04146326,-0.051348116,-0.04916518,0.11167267,0.024364555,-0.041667026,-0.11037943,0.0044380506,0.056236412,-0.024474677,0.04057372,-0.0027188791,0.058128394,-0.017346838,-0.036394607,0.082541786,0.0242206,-0.04256281,0.14417732,-0.07035165,0.017454665,-0.009577213,0.09502153,0.038508248,0.0070043267,0.043895252,-0.001193279,0.010792739,0.060535956,-0.08666454,0.082848996,0.04320536,-0.021906815,0.0618661,0.005357269,-0.052715316,-0.06449482,0.024603661,-0.012402614,-0.022025079,-0.03473009,0.040200174,-0.05909769,0.07725778,0.0014239001,0.041351408,-0.01255123,-0.043852795,0.038360048,0.06033158,0.058049746,0.014120175,0.030935045,0.06861859,-0.008444312,-0.051834807,0.010128204,-0.016706236,-0.08319953,-0.03146907,0.021203905,-0.06158379,-0.008437664,-0.07854885,-0.038273375,0.040938847,-0.032513913,0.024002245,0.04071897,0.02512702,-0.032434285,0.042358663,0.019370584,0.05517183,-0.08110809,0.014137635,0.045576017,-1.32192195e-08,-0.005035057,-0.091246285,0.07909518,0.022639062,-0.058264926,-0.0014403187,-0.039420933,-0.017998332,-0.013619899,-0.0028633664,0.022458153,0.019639583,-0.07365951,0.08190847,0.036873005,-0.045506034,-0.06571224,0.020556567,-0.0217907,0.008628898,-0.007868095,0.08175781,0.09163357,0.038738534,-0.09850236,0.027772842,0.07438346,0.075876474,0.0058803805,-0.024873465,0.05767668,0.02670236,-0.010350296,-0.06571452,0.043231923,-0.0195677,0.01010722,0.06050948,0.006013165,0.07978558,-0.104043365,-0.045714024,-0.027857127,-0.020202242,-0.009798013,-0.059204496,-0.073816665,-0.109491855,-0.05248461,-0.041468285,0.0078320475,-0.0008569036,0.0070594056,-0.051290046,-0.023197958,0.024179218,0.026810091,-0.051586982,-0.07698128,0.0167763,0.08511925,-0.015266711,0.10052256,-0.0003552359]"

export const PRODUCT = {
  id: "1a13b49d-b43d-4eba-838d-a77c9d94f743",
  title: "Test product",
  description: "Product description",
  images: ["https://example.com/product-image.jpg"],
  brand: BRAND.name,
  embedding: JSON.parse(EMBEDDING_FROM_PG),
  category: CATEGORY.name,
  tags: [TAG.name],
}

export const SELLER = {
  name: "test seller",
}

export const OFFER = {
  id: "a7a9160a-b3fd-4fed-97fe-7032322da08c",
  product: PRODUCT.id,
  seller: SELLER.name,
  price: 70,
  currency: "EUR",
  url: PAGE.url,
  site: PAGE.site,
}
