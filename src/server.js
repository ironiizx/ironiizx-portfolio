"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();

const PORT =
  process.env.PORT || 3000;


/* ==================================================
   RUTAS DEL PROYECTO
================================================== */

const publicPath =
  path.resolve(
    __dirname,
    "../public"
  );

const projectsPath =
  path.resolve(
    __dirname,
    "../data/projects.json"
  );


/* ==================================================
   MIDDLEWARES
================================================== */

app.disable("x-powered-by");

app.use(
  express.json({
    limit: "100kb"
  })
);


/* ==================================================
   API DE PROYECTOS
================================================== */

app.get(
  "/api/projects",
  async (request, response) => {
    try {
      const fileContent =
        await fs.readFile(
          projectsPath,
          "utf8"
        );

      const projects =
        JSON.parse(fileContent);

      if (!Array.isArray(projects)) {
        return response
          .status(500)
          .json({
            message:
              "projects.json debe contener un array."
          });
      }

      /*
        Evita que el navegador o Vercel
        conserven una versión anterior del JSON.
      */

      response.set({
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0"
      });

      return response
        .status(200)
        .json(projects);
    } catch (error) {
      console.error(
        "Error al cargar projects.json:",
        error
      );

      return response
        .status(500)
        .json({
          message:
            "No se pudieron cargar los proyectos."
        });
    }
  }
);


/* ==================================================
   ARCHIVOS PÚBLICOS
================================================== */

app.use(
  express.static(
    publicPath,
    {
      /*
        El HTML no queda almacenado durante mucho
        tiempo y los cambios se reflejan correctamente.
      */

      etag: true,

      index: "index.html",

      maxAge:
        process.env.NODE_ENV ===
        "production"
          ? "1h"
          : 0
    }
  )
);


/* ==================================================
   PÁGINA PRINCIPAL
================================================== */

app.get(
  "/",
  (request, response) => {
    response.set(
      "Cache-Control",
      "no-cache"
    );

    return response.sendFile(
      path.join(
        publicPath,
        "index.html"
      )
    );
  }
);


/* ==================================================
   ERROR 404 PARA RUTAS API
================================================== */

app.use(
  "/api",
  (request, response) => {
    return response
      .status(404)
      .json({
        message:
          "La ruta solicitada no existe."
      });
  }
);


/* ==================================================
   INICIAR SERVIDOR LOCAL
================================================== */

/*
  En local, Node ejecuta este bloque con app.listen().

  En Vercel, la aplicación se exporta y la plataforma
  se encarga de ejecutar Express como una función.
*/

if (require.main === module) {
  app.listen(
    PORT,
    () => {
      console.log(
        "======================================"
      );

      console.log(
        "iRoniiZx Portfolio iniciado"
      );

      console.log(
        `http://localhost:${PORT}`
      );

      console.log(
        `API: http://localhost:${PORT}/api/projects`
      );

      console.log(
        `JSON: ${projectsPath}`
      );

      console.log(
        "======================================"
      );
    }
  );
}


/* ==================================================
   EXPORTAR PARA VERCEL
================================================== */

module.exports = app;