var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_express7 = __toESM(require("express"));
var import_express_async_errors = require("express-async-errors");
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_cors = __toESM(require("cors"));

// src/routes/index.ts
var import_express6 = require("express");

// src/routes/session.routes.ts
var import_express = require("express");

// src/database/connection.ts
var import_oracledb = __toESM(require("oracledb"));
import_oracledb.default.initOracleClient({
  libDir: "C:\\Oracle"
});
var connection = async () => {
  import_oracledb.default.outFormat = import_oracledb.default.OUT_FORMAT_OBJECT;
  return import_oracledb.default.getConnection({
    user: "SINDU",
    password: "RELAT",
    // connectionString: '26.207.125.27/RENATO',
    // connectString: 'localhost/XE',
    connectString: "26.95.44.106/XE"
  });
};
var connection_default = connection;

// src/models/Signin.ts
var Signin = class {
  async create({ user, pass }) {
    const conn = await connection_default();
    const query = `
        SELECT
          C.SET_DESC SETOR,
          C.SET_COD COD_SETOR,
          B.USU_NOME LOGIN,
          B.ESB_COD ESTAB
        FROM
          SINUSUARIOS A, SINUSUSETOR B, SINSETOR C
        WHERE
          (B.USU_NOME = '${user}' AND A.USU_SENHA = '${pass}') AND
          A.USU_NOME = B.USU_NOME AND
          B.SET_COD = C.SET_COD
    `;
    const data = await conn.execute(query);
    if (conn) await conn.close();
    return data.rows[0];
  }
};

// src/controllers/SessionController.ts
var import_md5 = __toESM(require("md5"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/config/auth.ts
var auth_default = {
  jwt: {
    secret: "ce7d3b8bea4348b29b74f0685057854e673e5416",
    expiresIn: "1d"
  }
};

// src/errors/AppError.ts
var AppError = class {
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
};
var AppError_default = AppError;

// src/controllers/SessionController.ts
var signinModel = new Signin();
var SessionController = class {
  async logon(params) {
    if (!params.user || !params.pass) {
      throw new AppError_default("Usu\xE1rio ou Senha Obrigat\xF3rios", 400);
    }
    const data = {
      user: params.user.toLocaleUpperCase(),
      pass: (0, import_md5.default)(params.pass.toLocaleUpperCase()).toLocaleUpperCase()
    };
    const userlogged = await signinModel.create(data);
    if (!userlogged) {
      throw new AppError_default("Usu\xE1rio ou Senha Incorretos! Tente Novamente.", 400);
    }
    const { secret, expiresIn } = auth_default.jwt;
    const token = import_jsonwebtoken.default.sign({ data: userlogged }, secret, { expiresIn });
    return {
      token,
      user: params.user
    };
  }
};

// src/routes/session.routes.ts
var sessionRoutes = (0, import_express.Router)();
var sessionController = new SessionController();
sessionRoutes.post("/", async (request, response) => {
  const params = request.body;
  const { token, user } = await sessionController.logon(params);
  response.cookie("token", token, {
    expires: new Date((/* @__PURE__ */ new Date()).setDate((/* @__PURE__ */ new Date()).getDate() + 1))
    // secure: true,
    // sameSite: 'none',
  });
  response.json({ token, user });
});
sessionRoutes.get("/logout", (request, response) => {
  response.clearCookie("token");
  response.redirect("/");
});
var session_routes_default = sessionRoutes;

// src/routes/view.routes.ts
var import_express2 = require("express");

// src/middlewares/ValidadeToken.ts
var import_jsonwebtoken2 = require("jsonwebtoken");
async function ValidateToken(request, response, next) {
  const { token } = request.cookies;
  const { secret } = auth_default.jwt;
  if (!token) {
    return response.render("index", { auth: false });
  }
  try {
    const decoded = (0, import_jsonwebtoken2.verify)(token, secret);
    request.user = decoded;
    return next();
  } catch {
    return response.render("index", { auth: false });
  }
}

// src/routes/view.routes.ts
var appRoutes = (0, import_express2.Router)();
appRoutes.get("/", (request, response) => {
  if (request.cookies.token) {
    return response.redirect("/home");
  }
  return response.render("index", { auth: true });
});
appRoutes.get("/home", ValidateToken, (request, response) => {
  response.render("home", {
    user: {
      LOGIN: request.user.data.LOGIN[0].toUpperCase() + request.user.data.LOGIN.substr(1).toLowerCase(),
      SETOR: request.user.data.SETOR[0].toUpperCase() + request.user.data.SETOR.substr(1).toLowerCase()
    }
  });
});
appRoutes.get("/producao/apontamento", ValidateToken, (request, response) => {
  return response.render("apontamento", {
    user: {
      LOGIN: request.user.data.LOGIN[0].toUpperCase() + request.user.data.LOGIN.substr(1).toLowerCase(),
      SETOR: request.user.data.SETOR[0].toUpperCase() + request.user.data.SETOR.substr(1).toLowerCase()
    }
  });
});
appRoutes.get("/producao/etiqueta", ValidateToken, (request, response) => {
  return response.render("etiqueta", {
    user: {
      LOGIN: request.user.data.LOGIN[0].toUpperCase() + request.user.data.LOGIN.substr(1).toLowerCase(),
      SETOR: request.user.data.SETOR[0].toUpperCase() + request.user.data.SETOR.substr(1).toLowerCase()
    }
  });
});
appRoutes.get(
  "/consultas/duplicatasAberto/",
  ValidateToken,
  (request, response) => {
    response.render("duplicatasAberto", {
      user: {
        LOGIN: request.user.data.LOGIN[0].toUpperCase() + request.user.data.LOGIN.substr(1).toLowerCase(),
        SETOR: request.user.data.SETOR[0].toUpperCase() + request.user.data.SETOR.substr(1).toLowerCase()
      }
    });
  }
);
appRoutes.get(
  "/consultas/duplicatasAtraso/",
  ValidateToken,
  (request, response) => {
    response.render("duplicatasAtraso", {
      user: {
        LOGIN: request.user.data.LOGIN[0].toUpperCase() + request.user.data.LOGIN.substr(1).toLowerCase(),
        SETOR: request.user.data.SETOR[0].toUpperCase() + request.user.data.SETOR.substr(1).toLowerCase()
      }
    });
  }
);
var view_routes_default = appRoutes;

// src/routes/load.routes.ts
var import_express3 = require("express");

// src/models/DataLoading.ts
var DataLoading = class {
  async estabelecimento(estab) {
    const data = (await (await connection_default()).execute(`SELECT ESB_COD, ESB_DESC FROM SINESTAB ORDER BY ESB_COD`)).rows;
    return data;
  }
  async setor() {
    const data = (await (await connection_default()).execute("SELECT SET_COD, SET_DESC FROM SINSETOR")).rows;
    return data;
  }
  async Clientes() {
    const data = (await (await connection_default()).execute(
      "SELECT CLI_COD, CLI_RAZAO_SOC FROM SINCLIENTES ORDER BY CLI_COD"
    )).rows;
    return data;
  }
  async Motivo() {
    const data = (await (await connection_default()).execute(
      "SELECT MOC_COD, MOC_DESC FROM SINMOTIVO_OCORRENCIA WHERE MOC_ATIVO = 'S' ORDER BY MOC_COD"
    )).rows;
    return data;
  }
  async Cor(data) {
    const conn = await connection_default();
    const query = `
      SELECT ESB_COD, OS_NUMER, A.ITE_COD, A.ITE_COD||' - '||B.ITE_DESC DESC_ITEM
      FROM SINOSITEM_INDUSTR A, SINITEM B
      WHERE A.ESB_COD  = ${data.ESB_COD} AND
            A.OS_NUMER = ${data.OS_NUMER} AND
            A.TIP_COD  = B.TIP_COD AND
            A.ITE_COD  = B.ITE_COD
      GROUP BY ESB_COD, OS_NUMER, A.ITE_COD, B.ITE_DESC
    `;
    const result = await conn.execute(query);
    return result.rows;
  }
};

// src/controllers/DataLoadingController.ts
var dataLoading = new DataLoading();
var DataLoadingController = class {
  async getEstab(estab) {
    return dataLoading.estabelecimento(estab);
  }
  async getSetor() {
    return dataLoading.setor();
  }
  async getClientes() {
    return dataLoading.Clientes();
  }
  async getMotivo() {
    return dataLoading.Motivo();
  }
  async getCor(data) {
    return dataLoading.Cor(data);
  }
};

// src/routes/load.routes.ts
var loadRoutes = (0, import_express3.Router)();
var sessionController2 = new DataLoadingController();
loadRoutes.get("/estab", ValidateToken, async (request, response) => {
  const { ESTAB } = request.user.data;
  const data = await sessionController2.getEstab(ESTAB);
  response.json(data);
});
loadRoutes.get("/setor", async (_, response) => {
  const data = await sessionController2.getSetor();
  response.json(data);
});
loadRoutes.get("/clientes", async (_, response) => {
  const data = await sessionController2.getClientes();
  response.json(data);
});
loadRoutes.get("/motivo", async (_, response) => {
  const data = await sessionController2.getMotivo();
  response.json(data);
});
loadRoutes.get("/cor", async (request, response) => {
  const data = request.query;
  return response.json(await sessionController2.getCor(data));
});
var load_routes_default = loadRoutes;

// src/routes/production.routes.ts
var import_express4 = require("express");

// src/database/sqlite3.connection.ts
var import_sqlite3 = __toESM(require("sqlite3"));
var db = new import_sqlite3.default.Database("log.db");
db.run(
  "CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, params TEXT, user TEXT, date TEXT, type TEXT, resource TEXT)"
);
async function InsertLog(data) {
  try {
    db.run(
      "INSERT INTO log (params, user, date, type, resource) VALUES (?, ?, ?, ?, ?)",
      [data.params, data.user, data.date, data.type, data.resource]
    );
  } catch (error) {
    console.log(error);
  }
}

// src/models/Production.ts
var ProductionModel = class {
  GetFIle(pathFile) {
    if (pathFile) {
      return pathFile.replaceAll("\\", " ").split(" ").at(-1);
    }
    return "";
  }
  async getDataOS(data) {
    const conn = await connection_default();
    const queryValidateSetor = `
      SELECT SPO_SEQ
      FROM SINSETPROC_OS
      WHERE ESB_COD = ${data.Estab} AND SET_COD = ${data.Setor}
    `;
    const resultQuery = (await conn.execute(queryValidateSetor)).rows[0];
    const Seq = resultQuery?.SPO_SEQ;
    if (Seq === void 0) {
      throw new AppError_default(
        "Seq. de Processo informado n\xE3o vinculado ao estabelecimento",
        400
      );
    }
    let queryDataAppont = "";
    if (Seq === 1) {
      queryDataAppont = `
          SELECT A.ESB_COD,
          A.OS_NUMER,
          A.OSI_SEQ,
          A.OSS_SEQ,
          A.TIP_COD,
          A.ITE_COD COD_COR,
          A.OSS_ITE_COD COD_PERFIL,
          A.OSS_QUANT QUANT_KG,
          A.OSS_QUANT_PECAS QUANT_PC,
          NVL(QUANT_RESTANTE,0) + OSS_QUANT_PECAS +  NVL(QUANT_REJEITADA,0) QUANT_RESTANTE
    FROM SINOSITEM_INDUSTR A
      INNER JOIN (SELECT A.ESB_COD,
                        OS_NUMER,
                        OSI_SEQ,
                        OSS_SEQ,
                        NVL(A.SPO_SEQ, 0) SPO_SEQ,
                        B.SET_COD,
                        IPO_SEQ
                  FROM SININFOSETPROC_OS A, SINSETPROC_OS B
                  WHERE A.SET_COD  = B.SET_COD AND
                        A.ESB_COD  = B.ESB_COD
                  ) B ON (A.ESB_COD    = B.ESB_COD(+) AND
                          A.OS_NUMER  = B.OS_NUMER(+) AND
                          A.OSI_SEQ    = B.OSI_SEQ(+) AND
                          A.OSS_SEQ    = B.OSS_SEQ(+))
      LEFT JOIN (SELECT C.ESB_COD,
                        C.OS_NUMER,
                        C.OSI_SEQ,
                        C.OSS_SEQ,
                        DECODE(C.SPO_SEQ, NULL, 1, C.SPO_SEQ) SPO_SEQ,
                        (-1)*NVL(SUM(C.IPO_QUANT_PROD), 0)             QUANT_RESTANTE,
                        (-1)*NVL(SUM(C.IPO_QUANT_REJEI), 0)            QUANT_REJEITADA
                FROM  SININFOSETPROC_OS C, SINOSITEM_INDUSTR D
                WHERE C.ESB_COD = D.ESB_COD AND
                      C.OS_NUMER = D.OS_NUMER AND
                      C.OSI_SEQ = D.OSI_SEQ AND
                      C.OSS_SEQ = D.OSS_SEQ
                GROUP BY C.ESB_COD, C.OS_NUMER, C.OSI_SEQ, C.SPO_SEQ,C.OSS_SEQ
                UNION
                  (SELECT C.ESB_COD,
                          C.OS_NUMER,
                          C.OSI_SEQ,
                          C.OSS_SEQ,
                          DECODE(C.SPO_SEQ, NULL, 1, C.SPO_SEQ) + 1 SPO_SEQ,
                          NVL(SUM(C.IPO_QUANT_PROD), 0)             QUANT_RESTANTE,
                          NVL(SUM(C.IPO_QUANT_REJEI), 0)            QUANT_REJEITADA
                    FROM SININFOSETPROC_OS C, SINOSITEM_INDUSTR D
                    WHERE C.ESB_COD = D.ESB_COD AND
                          C.OS_NUMER = D.OS_NUMER AND
                          C.OSI_SEQ = D.OSI_SEQ AND
                          C.OSS_SEQ = D.OSS_SEQ
                    GROUP BY C.ESB_COD, C.OS_NUMER, C.OSI_SEQ, C.SPO_SEQ, C.OSS_SEQ)
                ) C ON (A.ESB_COD = C.ESB_COD AND
                        A.OS_NUMER = C.OS_NUMER AND
                        A.OSI_SEQ = C.OSI_SEQ AND
                        A.OSS_SEQ = C.OSS_SEQ AND
                        B.SPO_SEQ = C.SPO_SEQ)
    WHERE A.ESB_COD  = ${data.Estab} and
      A.OS_NUMER = ${data.OS} and
      A.ITE_COD  = '${data.Cor}'
    GROUP BY A.ESB_COD,
          A.OS_NUMER,
          A.OSI_SEQ,
          A.OSS_SEQ,
          A.STO_COD,
          A.TIP_COD,
          A.ITE_COD,
          A.OSS_ITE_COD,
          A.OSS_QUANT,
          A.OSS_QUANT_PECAS,
          QUANT_RESTANTE,
          QUANT_REJEITADA
    ORDER BY A.ESB_COD, OS_NUMER, OSI_SEQ, OSS_SEQ
      `;
    } else {
      queryDataAppont = `
      SELECT  C.ESB_COD,
        C.OS_NUMER,
        C.OSI_SEQ,
        C.OSS_SEQ,
        C.OSS_SEQ,
        D.TIP_COD,
        D.ITE_COD COD_COR,
        D.OSS_ITE_COD COD_PERFIL,
        D.OSS_QUANT QUANT_KG,
        D.OSS_QUANT_PECAS QUANT_PC,
        NVL(NVL(SUM(C.IPO_QUANT_PROD), 0), D.OSS_QUANT_PECAS) + NVL((
             SELECT
                (-1)* NVL(SUM(ZC.IPO_QUANT_PROD), 0)
             FROM  SININFOSETPROC_OS ZC, SINOSITEM_INDUSTR ZD
             WHERE ZC.ESB_COD(+)  = ZD.ESB_COD AND
                   ZC.OS_NUMER(+) = ZD.OS_NUMER AND
                   ZC.OSI_SEQ(+)  = ZD.OSI_SEQ AND
                   ZC.OSS_SEQ(+)  = ZD.OSS_SEQ AND
                   ZD.ESB_COD  = ${data.Estab} AND
                   ZD.OS_NUMER = ${data.OS} AND
                   ZC.SPO_SEQ  = ${Seq} AND
                   ZD.ITE_COD = D.ITE_COD
             GROUP BY ZC.ESB_COD, ZC.OS_NUMER,
                      ZC.OSI_SEQ, ZC.SPO_SEQ,
                      ZC.OSS_SEQ, ZD.TIP_COD,
                      ZD.ITE_COD, ZD.OSS_ITE_COD,
                      ZD.OSS_QUANT, ZD.OSS_QUANT_PECAS
        ), 0) QUANT_RESTANTE,
        NVL(SUM(C.IPO_QUANT_REJEI), 0)            QUANT_REJEITADA
      FROM SININFOSETPROC_OS C, SINOSITEM_INDUSTR D
      WHERE C.ESB_COD = D.ESB_COD AND
            C.OS_NUMER = D.OS_NUMER AND
            C.OSI_SEQ = D.OSI_SEQ AND
            C.OSS_SEQ = D.OSS_SEQ AND
            C.ESB_COD = ${data.Estab} AND
            C.OS_NUMER = ${data.OS} AND
            C.SPO_SEQ = ${Seq - 1} AND
            D.ITE_COD = '${data.Cor}'
      GROUP BY C.ESB_COD, C.OS_NUMER, C.OSI_SEQ, C.SPO_SEQ,C.OSS_SEQ, D.TIP_COD, D.ITE_COD, D.OSS_ITE_COD, D.OSS_QUANT, D.OSS_QUANT_PECAS
      ORDER BY C.ESB_COD, C.OS_NUMER, C.OSI_SEQ, C.OSS_SEQ
      `;
    }
    const dataResponse = await conn.execute(queryDataAppont);
    const datafilter = dataResponse.rows.filter(
      (item) => item.QUANT_RESTANTE > 0
    );
    const dataMapped = await Promise.all(
      datafilter.map(async (item) => {
        const query = `
          SELECT NVL(MAX(B.IPO_SEQ), 0) + 1 SEQ_APONT,
                  C.ITE_COD ITEM,
                  D.ITE_IMAGEM
          FROM SINOSITEM_INDUSTR A, SININFOSETPROC_OS B, SINOSITEM C, SINITEM D
          WHERE A.ESB_COD  = ${data.Estab} AND
                A.OS_NUMER = ${data.OS} AND
                A.OSI_SEQ  = ${item.OSI_SEQ} AND
                A.OSS_SEQ  = ${item.OSS_SEQ} AND
                A.ESB_COD = B.ESB_COD(+) AND
                A.OS_NUMER = B.OS_NUMER(+) AND
                A.OSI_SEQ = B.OSI_SEQ(+) AND
                A.OSS_SEQ = B.OSS_SEQ(+) AND
                A.ESB_COD = C.ESB_COD AND
                A.OS_NUMER = C.OS_NUMER AND
                A.OSI_SEQ = C.OSI_SEQ AND
                C.TIP_COD = D.TIP_COD AND
                C.ITE_COD = D.ITE_COD
          GROUP BY C.ITE_COD, D.ITE_IMAGEM
        `;
        const result = await conn.execute(query);
        return {
          ...item,
          SEQ_APONT: result?.rows[0]?.SEQ_APONT || 1,
          ITEM: result?.rows[0]?.ITEM,
          ITE_IMAGEM: result?.rows[0]?.ITE_IMAGEM
        };
      })
    );
    return dataMapped.map((item) => {
      return {
        ...item,
        ITE_IMAGEM: this.GetFIle(item.ITE_IMAGEM)
      };
    });
  }
  async getDataOSAppontEtq(data) {
    const conn = await connection_default();
    const query = `
    SELECT
      A.OSI_SEQ,
      A.OSS_SEQ,
      B.TIP_COD,
      B.ITE_COD,
      B.OSS_ITE_COD,
      SUM(DECODE('${data.tipo}', 'prod', A.IPO_QUANT_PROD, A.IPO_QUANT_REJEI) - NVL((
        SELECT SUM(ZA.IPO_QUANT_PACOTES * ZA.IPO_QUANT_ETIQUETAS)
        FROM SININFOSETPROC_ETIQUETA ZA
        WHERE ZA.ESB_COD  = A.ESB_COD AND
              ZA.OS_NUMER = A.OS_NUMER AND
              ZA.OSI_SEQ  = A.OSI_SEQ AND
              ZA.OSS_SEQ  = A.OSS_SEQ AND
              TIPO_QUANT_APONT = '${data.tipo}'
    	),0)) QUANT_PC,
      TRUNC(B.OSS_QUANT / B.OSS_QUANT_PECAS * DECODE('${data.tipo}', 'prod', A.IPO_QUANT_PROD, A.IPO_QUANT_REJEI) - NVL((
        SELECT SUM(ZA.IPO_QUANT_PACOTES * ZA.IPO_QUANT_ETIQUETAS)
        FROM SININFOSETPROC_ETIQUETA ZA
        WHERE ZA.ESB_COD  = A.ESB_COD AND
              ZA.OS_NUMER = A.OS_NUMER AND
              ZA.OSI_SEQ  = A.OSI_SEQ AND
              ZA.OSS_SEQ  = A.OSS_SEQ AND
              TIPO_QUANT_APONT = '${data.tipo}'
    	),0),4) QUANT_KG
   FROM
    SININFOSETPROC_OS A, SINOSITEM_INDUSTR B
   WHERE
    A.ESB_COD = ${data.Estab} AND
    A.OS_NUMER = ${data.OS} AND
    A.SET_COD = ${data.Setor} AND
    B.ITE_COD = '${data.cor}' AND
    A.ESB_COD = B.ESB_COD AND
    A.OS_NUMER = B.OS_NUMER AND
    A.OSI_SEQ = B.OSI_SEQ AND
    A.OSS_SEQ = B.OSS_SEQ
  GROUP BY
      A.ESB_COD,
      A.OS_NUMER,
      A.OSI_SEQ,
      A.OSS_SEQ,
      B.TIP_COD,
      B.ITE_COD,
      B.OSS_ITE_COD,
      B.OSS_QUANT,
      B.OSS_QUANT_PECAS,
      A.IPO_QUANT_PROD,
      A.IPO_QUANT_REJEI
    `;
    const getSeqApont = `
    SELECT
      NVL(MAX(IPO_SEQ) + 1, 1) SEQ_APONT
    FROM
      SININFOSETPROC_ETIQUETA A
    WHERE
      A.ESB_COD  = ${data.Estab} AND
      A.OS_NUMER = ${data.OS}
    `;
    try {
      const responseData = await conn.execute(query);
      const getSeqApontResponse = await conn.execute(
        getSeqApont
      );
      const dataResponse = responseData.rows.map((item) => {
        return {
          ...item,
          SEQ_APONT: getSeqApontResponse.rows[0].SEQ_APONT
        };
      });
      return dataResponse;
    } catch (error) {
      console.log(error);
      throw new AppError_default("Problemas ao buscar os dados da OS.", 500);
    }
  }
  async getValidateOS({ OS, Estab }) {
    const conn = await connection_default();
    const query = `
  SELECT
    A.OS_NUMER,
    B.CLI_COD||'-'||SUBSTR(C.CLI_RAZAO_SOC, 0, 30) CLIENTE
  FROM
    SINOSITEM_INDUSTR A,
    SINORDSERVICO B,
    SINCLIENTES C
  WHERE
    A.ESB_COD = ${Estab} AND
    A.OS_NUMER = ${OS} AND
    A.ESB_COD = B.ESB_COD AND
    A.OS_NUMER = B.OS_NUMER AND
    B.CLI_COD = C.CLI_COD`;
    const data = await conn.execute(query);
    if (conn) await conn.close();
    return data.rows[0];
  }
  async CreateAppont(appont, user) {
    const conn = await connection_default();
    const resultQuery = (await conn.execute(`
      SELECT SPO_SEQ
      FROM SINSETPROC_OS
      WHERE ESB_COD = ${appont[0].ESB_COD} AND SET_COD = ${appont[0].SET_COD}`)).rows[0];
    if (resultQuery === void 0) {
      throw new AppError_default(
        "Seq. de Processo informado n\xE3o vinculado ao estabelecimento",
        400
      );
    }
    const appontItem = appont.map((item) => {
      return {
        ESB_COD: item.ESB_COD,
        OS_NUMER: item.OS_NUMER,
        OSI_SEQ: item.OSI_SEQ,
        OSS_SEQ: item.OSS_SEQ,
        SET_COD: item.SET_COD,
        SPO_SEQ: resultQuery.SPO_SEQ,
        IPO_SEQ: item.IPO_SEQ,
        IPO_QUANT_PROD: item.IPO_QUANT_PROD,
        IPO_QUANT_REJEI: item.IPO_QUANT_REJEI,
        IPO_USUAR: user.data.LOGIN,
        IPO_OBS: null,
        OPE_COD: null,
        MOC_COD: item.MOC_COD,
        OSS_OBS: item.OSS_OBS
      };
    });
    const query = `

      INSERT INTO SININFOSETPROC_OS (
        ESB_COD, OS_NUMER, OSI_SEQ, OSS_SEQ, SET_COD, SPO_SEQ, IPO_SEQ,
        IPO_DATA_EMIS, IPO_HORA_EMIS, IPO_DATA_TERM, IPO_HORA_TERM,
        IPO_QUANT_PROD,IPO_QUANT_REJEI, IPO_USUAR, IPO_DATA_SIST, IPO_OBS,
        OPE_COD,MOC_COD,OSS_OBS
      )
      VALUES (
        :ESB_COD, :OS_NUMER, :OSI_SEQ, :OSS_SEQ, :SET_COD, :SPO_SEQ, :IPO_SEQ,
        TRUNC(SYSDATE), TO_CHAR(SYSDATE,'HH24:MM:SS'), TRUNC(SYSDATE), TO_CHAR(SYSDATE,'HH24:MM:SS'),
        :IPO_QUANT_PROD, :IPO_QUANT_REJEI, :IPO_USUAR, TRUNC(SYSDATE), :IPO_OBS, :OPE_COD, :MOC_COD, :OSS_OBS
      )
    `;
    try {
      await conn.executeMany(query, appontItem);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      console.log(err);
    } finally {
      if (conn) await conn.close();
    }
  }
  async CreateAppontEtq(appont, user) {
    const conn = await connection_default();
    const appontItem = appont.map((item) => {
      return {
        ESB_COD: item.ESB_COD,
        OS_NUMER: item.OS_NUMER,
        OSI_SEQ: item.OSI_SEQ,
        OSS_SEQ: item.OSS_SEQ,
        SET_COD: item.SET_COD,
        IPO_SEQ: item.IPO_SEQ,
        IPO_QUANT_PACOTES: item.IPO_QUANT_PACOTES,
        IPO_QUANT_ETIQUETAS: item.IPO_QUANT_ETIQUETAS,
        IPO_USUAR: user.data.LOGIN
      };
    });
    const query = `
    INSERT INTO SININFOSETPROC_ETIQUETA (
      esb_cod,os_numer,osi_seq,
      oss_seq,set_cod,ipo_seq,
      ipo_data_emis,ipo_hora_emis,
      ipo_quant_pacotes,ipo_quant_etiquetas,
      ipo_usuar
    )
    VALUES (
      :ESB_COD, :OS_NUMER, :OSI_SEQ, :OSS_SEQ, :SET_COD, :IPO_SEQ,
      TRUNC(SYSDATE), TO_CHAR(SYSDATE,'HH24:MM:SS'),:IPO_QUANT_PACOTES, :IPO_QUANT_ETIQUETAS,
      :IPO_USUAR
    )
  `;
    try {
      await conn.executeMany(query, appontItem);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      console.log(err);
    } finally {
      if (conn) await conn.close();
    }
  }
  async getAppontHome(setor) {
    const conn = await connection_default();
    const querySeqSetor = `
      SELECT SPO_SEQ
      FROM SINSETPROC_OS
      WHERE SET_COD = ${setor}
    `;
    const queryBuscarApontados = `
      SELECT A.ESB_COD, A.OS_NUMER,C.MCO_NUMER_DOC, D.FON_RAZAO_SOC, E.CLI_RAZAO_SOC
      FROM SININFOSETPROC_OS A, SINOSITEM_INDUSTR B, SINORDSERVICO C, SINFORNEC D, SINCLIENTES E
      WHERE A.SET_COD = ${setor} AND
            A.ESB_COD(+)  = B.ESB_COD AND
            A.OS_NUMER(+) = B.OS_NUMER AND
            A.OSI_SEQ (+) = B.OSI_SEQ AND
            A.OSS_SEQ(+)  = B.OSS_SEQ AND
            (SELECT SUM(A.IPO_QUANT_PROD + A.IPO_QUANT_REJEI)
              FROM SININFOSETPROC_OS ZA
              WHERE ZA.ESB_COD = A.ESB_COD AND
                    ZA.OS_NUMER = A.OS_NUMER AND
                    ZA.OSI_SEQ = A.OSI_SEQ AND
                    ZA.OSS_SEQ = A.OSS_SEQ AND
                    ZA.SET_COD = A.SET_COD) <
            (SELECT SUM(B.OSS_QUANT_PECAS)
              FROM SINOSITEM_INDUSTR ZB
              WHERE ZB.ESB_COD  = B.ESB_COD AND
                    ZB.OS_NUMER = B.OS_NUMER AND
                    ZB.OSI_SEQ  = B.OSI_SEQ
            ) AND C.ESB_COD  = B.ESB_COD AND
                  C.OS_NUMER = B.OS_NUMER AND
                  C.FON_COD = D.FON_COD AND
                  C.STO_COD < 90 AND
                  E.CLI_COD = C.CLI_COD
      GROUP BY A.ESB_COD, A.OS_NUMER, A.OSI_SEQ, C.MCO_NUMER_DOC, D.FON_RAZAO_SOC, E.CLI_RAZAO_SOC
      ORDER BY A.ESB_COD, A.OS_NUMER
    `;
    const queryBuscarNaoApontados = `
      SELECT A.ESB_COD, A.OS_NUMER, B.MCO_NUMER_DOC, C.FON_RAZAO_SOC, D.CLI_RAZAO_SOC
      FROM SINOSITEM_INDUSTR A, SINORDSERVICO B, SINFORNEC C, SINCLIENTES D
      WHERE A.ESB_COD = B.ESB_COD AND
            A.OS_NUMER = B.OS_NUMER AND
            B.FON_COD = C.FON_COD AND
        NOT EXISTS (
            SELECT * FROM SININFOSETPROC_OS ZA
            WHERE ZA.ESB_COD  = A.ESB_COD AND
                  ZA.OS_NUMER = A.OS_NUMER AND
                  ZA.OSI_SEQ  = A.OSI_SEQ
      ) AND
      LENGTH(A.OS_NUMER) < 10 AND
      B.STO_COD < 90 AND
      D.CLI_COD = B.CLI_COD
      GROUP BY A.ESB_COD, A.OS_NUMER, B.MCO_NUMER_DOC, C.FON_RAZAO_SOC, D.CLI_RAZAO_SOC
      ORDER BY ESB_COD, OS_NUMER
    `;
    const [{ SPO_SEQ: seq }] = (await conn.execute(querySeqSetor)).rows;
    if (seq === 1) {
      const resultApontados = (await conn.execute(queryBuscarApontados)).rows;
      const resultNaoApontados = (await conn.execute(queryBuscarNaoApontados)).rows;
      return {
        setor,
        data: [...resultApontados, ...resultNaoApontados]
      };
    }
    const result = (await conn.execute(queryBuscarApontados)).rows;
    return result;
  }
};

// src/controllers/ProdutionController.ts
var productionModel = new ProductionModel();
var ProductionController = class {
  async getDataOs(data) {
    if (!data.Estab || !data.OS || !data.Setor || !data.Cor) {
      throw new AppError_default("Parametros Informados Incorretos");
    }
    const result = await productionModel.getDataOS(data);
    return result;
  }
  async getDataOSAppont(data) {
    if (!data.Estab || !data.OS || !data.Setor || !data.cor) {
      throw new AppError_default("Parametros Informados Incorretos");
    }
    const result = await productionModel.getDataOSAppontEtq(data);
    return result;
  }
  async getValidateOS(data) {
    if (!data.Estab || !data.OS) {
      throw new AppError_default("Parametros Informados Incorretos");
    }
    const result = await productionModel.getValidateOS(data);
    return result;
  }
  async createAppont(data, user) {
    if (data.length === 0) {
      throw new AppError_default("Parametros Informados Incorretos");
    }
    await InsertLog({
      params: JSON.stringify(data),
      user: user.data.LOGIN,
      date: (/* @__PURE__ */ new Date()).toLocaleString(),
      type: "insert",
      resource: "Cria\xE7\xE3o de Apontamento"
    });
    return productionModel.CreateAppont(data, user);
  }
  CreateAppontEtq(data, user) {
    if (data.length === 0) {
      throw new AppError_default("Parametros Informados Incorretos");
    }
    return productionModel.CreateAppontEtq(data, user);
  }
  async getAppontHome(setor) {
    return productionModel.getAppontHome(setor);
  }
};

// src/routes/production.routes.ts
var produtionController = new ProductionController();
var productionRouter = (0, import_express4.Router)();
productionRouter.get("/listOS", ValidateToken, async (request, response) => {
  const data = request.query;
  response.json(await produtionController.getDataOs(data));
});
productionRouter.get(
  "/listOSAppont",
  // ValidateToken,
  async (request, response) => {
    const data = request.query;
    response.json(await produtionController.getDataOSAppont(data));
  }
);
productionRouter.get(
  "/validateOS",
  ValidateToken,
  async (request, response) => {
    const data = request.query;
    response.json(
      await produtionController.getValidateOS(data)
    );
  }
);
productionRouter.post(
  "/createAppont",
  ValidateToken,
  async (request, response) => {
    const data = request.body;
    produtionController.createAppont(data, request.user);
    response.status(200).end();
  }
);
productionRouter.post(
  "/createAppontEtq",
  ValidateToken,
  async (request, response) => {
    const data = request.body;
    produtionController.CreateAppontEtq(data, request.user);
    response.status(200).end();
  }
);
productionRouter.get(
  "/appontHome",
  ValidateToken,
  async (request, response) => {
    return response.json(
      await produtionController.getAppontHome(request.user.data.COD_SETOR)
    );
  }
);
var production_routes_default = productionRouter;

// src/routes/finances.routes.ts
var import_express5 = require("express");

// src/models/Finances.ts
var import_dayjs = __toESM(require("dayjs"));
var Finances = class {
  async duplicasAberto(data) {
    const conn = await connection_default();
    const query = `

          SELECT TO_CHAR(SYSDATE, 'DD/MM/YYYY')   DATA_SISTEMA,
          TO_CHAR(SYSDATE, 'HH:MI')                        HORA_SISTEMA,
          A.ESB_COD                                                      ESTAB_COD,
          B.ESB_DESC                                                    ESTAB_NOME,
          A.CLI_COD                                                        CLI_COD,
        SUBSTR(C.CLI_RAZAO_SOC,1,20)                  CLI_NOME,
          C.CLI_FONE                                                      TELEFONE,
          SUBSTR(D.VEN_NOME,1,20)                                   VENDEDOR,
          A.DUP_NUMER||'/'||DUP_SEQ                                 DUPLIC,
          A.DUP_DATA_PRORROGA                                     DT_VENC,
          A.DUP_VALOR_CR$ - A.DUP_VALOR_ABATI_CR$ + A.DUP_VALOR_JUROS_CR$ - A.DUP_VALOR_DESC_CR$ - A.DUP_VALOR_PAGTO_CR$      VALOR_CR$,
          TRUNC(SYSDATE) - DUP_DATA_PRORROGA         ATRASO,
          A.DUP_NUMER_BANCO
      FROM   SINDUPLIC A, SINESTAB B, SINCLIENTES C, SINVENDEDOR D
      WHERE  (A.ESB_COD = 1 AND
                    A.DUP_DATA_PRORROGA >= TRUNC(SYSDATE)    AND
                    --A.DUP_DATA_PRORROGA < TRUNC(SYSDATE)     AND
                    A.SDU_COD < 30)                                                         AND
                    A.CLI_COD BETWEEN ${data.cliIni} AND ${data.cliFin}        AND
                    A.DUP_DATA_PAGTO    IS NULL                    AND
                    A.DUP_DATA_CANC IS NULL                         AND
          A.VEN_COD BETWEEN 1 AND 999999  AND
          A.DUP_DATA_PRORROGA BETWEEN TO_DATE('${(0, import_dayjs.default)(data.dataIni).format(
      "DD/MM/YYYY"
    )}', 'DD/MM/YYYY') AND TO_DATE('${(0, import_dayjs.default)(data.dataFini).format(
      "DD/MM/YYYY"
    )}', 'DD/MM/YYYY') and
          A.DUP_SEQ BETWEEN TO_NUMBER(1) AND TO_NUMBER(9999) AND
          (A.ESB_COD        =  B.ESB_COD)                     AND
          (A.CLI_COD        =  C.CLI_COD)                     AND
          (C.VEN_COD        =  D.VEN_COD)
      ORDER  BY C.CLI_RAZAO_SOC, A.DUP_NUMER, A.DUP_SEQ
    `;
    const result = await conn.execute(query);
    if (conn) await conn.close();
    return result.rows;
  }
  async duplicatasAtraso(data) {
    const conn = await connection_default();
    const query = `

    SELECT TO_CHAR(SYSDATE, 'DD/MM/YYYY')     DATA_SISTEMA,
    TO_CHAR(SYSDATE, 'HH:MI')                         HORA_SISTEMA,
    A.ESB_COD                                                 ESTAB_COD,
    B.ESB_DESC                                                ESTAB_NOME,
    A.CLI_COD                                                 CLI_COD,
    C.CLI_RAZAO_SOC,
    A.CLI_COD|| ' - ' || SUBSTR(C.CLI_RAZAO_SOC,1,19)              CLI_NOME,
    C.CLI_FONE                                                TELEFONE,
    C.CLI_CGC_C                                               CNPJ_C,
    SUBSTR(D.VEN_NOME,1,20)                                  VENDEDOR,
    A.DUP_NUMER||'/'||DUP_SEQ                                 DUPLIC,
    A.DUP_DATA_PRORROGA                                       DT_VENC,
    (A.DUP_VALOR_CR$ + A.DUP_VALOR_JUROS_CR$) - (A.DUP_VALOR_ABATI_CR$ + A.DUP_VALOR_DESC_CR$ + A.DUP_VALOR_PAGTO_CR$)    VALOR_CR$,
    A.DUP_VALOR_ABATI_CR$                                VALOR_ABATI_CR$,
    A.DUP_VALOR_DESC_CR$                                VALOR_DESC_CR$,
    A.DUP_VALOR_JUROS_CR$                              VALOR_JUROS_CR$,
    TRUNC(SYSDATE) - DUP_DATA_PRORROGA        ATRASO,
    A.DUP_NUMER_BANCO                         BANCO
FROM   SINDUPLIC A, SINESTAB B, SINCLIENTES C, SINVENDEDOR D, SINMOVVEN E
WHERE  (A.ESB_COD = ${data.estab} AND
     A.SDU_COD < 30                 AND
     E.VEN_COD BETWEEN 1 AND 999999 AND
     A.DUP_DATA_PRORROGA BETWEEN TO_DATE('${(0, import_dayjs.default)(data.dataIni).format(
      "DD/MM/YYYY"
    )}', 'DD/MM/YYYY') AND TO_DATE('${(0, import_dayjs.default)(data.dataFini).format(
      "DD/MM/YYYY"
    )}', 'DD/MM/YYYY') AND
     A.DUP_DATA_PRORROGA  < TRUNC(SYSDATE) AND
     A.CLI_COD BETWEEN ${data.cliIni}  AND ${data.cliFin}   AND
     A.DUP_SEQ BETWEEN 1  AND 99999) AND
    (A.ESB_COD        =  B.ESB_COD) AND
    (A.CLI_COD        =  C.CLI_COD) AND
    (C.VEN_COD        =  D.VEN_COD AND
     A.ESB_COD = E.ESB_COD AND A.MVE_SERIE_DOC = E.MVE_SERIE_DOC AND A.MVE_NUMER_DOC = E.MVE_NUMER_DOC)
ORDER  BY C.CLI_RAZAO_SOC, A.DUP_NUMER, A.DUP_SEQ

    `;
    const result = await conn.execute(query);
    if (conn) await conn.close();
    return result.rows;
  }
};

// src/controllers/FinancesController.ts
var dataFinances = new Finances();
var DataLoadingController2 = class {
  async getDuplicatasAberto(data) {
    const dataFormatted = {
      estab: data.estab,
      cliIni: data.cliIni || 1,
      cliFin: data.cliFin || 999999,
      dataIni: data.dataIni || /* @__PURE__ */ new Date(),
      dataFini: data.dataFini || /* @__PURE__ */ new Date()
    };
    return dataFinances.duplicasAberto(dataFormatted);
  }
  async getDuplicataAtraso(data) {
    const dataFormatted = {
      estab: data.estab,
      cliIni: data.cliIni || 1,
      cliFin: data.cliFin || 999999,
      dataIni: data.dataIni || /* @__PURE__ */ new Date(),
      dataFini: data.dataFini || /* @__PURE__ */ new Date()
    };
    return dataFinances.duplicatasAtraso(dataFormatted);
  }
};

// src/routes/finances.routes.ts
var financesRoutes = (0, import_express5.Router)();
var financesController = new DataLoadingController2();
financesRoutes.get("/dupAberto", async (request, response) => {
  const data = request.query;
  const responseData = await financesController.getDuplicatasAberto(
    data
  );
  const statusCode = responseData.length === 0 ? 404 : 200;
  response.status(statusCode).json(responseData);
});
financesRoutes.get("/dupAtraso", async (request, response) => {
  const data = request.query;
  const responseData = await financesController.getDuplicataAtraso(
    data
  );
  const statusCode = responseData.length === 0 ? 404 : 200;
  response.status(statusCode).json(responseData);
});
var finances_routes_default = financesRoutes;

// src/routes/index.ts
var routes = (0, import_express6.Router)();
routes.use("/api/sessions", session_routes_default);
routes.use("/api/loads", load_routes_default);
routes.use("/api/production", production_routes_default);
routes.use("/api/finances", finances_routes_default);
routes.use("/", view_routes_default);
var routes_default = routes;

// src/server.ts
var app = (0, import_express7.default)();
app.enable("trust proxy");
app.set("view engine", "ejs");
app.set("views", "./views/");
app.use((0, import_cors.default)());
app.use((0, import_cookie_parser.default)());
app.use(import_express7.default.json());
app.use("/", routes_default);
app.use(import_express7.default.static("./public/"));
app.use((err, req, res, _) => {
  if (err instanceof AppError_default) {
    return res.status(err.statusCode).json({
      status: "Error",
      message: err.message
    });
  }
  console.error(err);
  return res.status(500).json({
    status: "Error",
    message: "Internal Server Error"
  });
});
app.listen(3333, () => {
  console.log(`\u{1F680} Server Started at http://localhost:3333`);
});
//# sourceMappingURL=server.js.map