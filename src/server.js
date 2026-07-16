"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();

const PORT =
  process.env.PORT || 3000;

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

app.use(express.json());


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

      response.set(
        "Cache-Control",
        "no-store"
      );

      console.log(
        `Proyectos cargados: ${projects.length}`
      );

      return response.json(
        projects
      );
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
    publicPath
  )
);


/* ==================================================
   PÁGINA PRINCIPAL
================================================== */

app.get(
  "/",
  (request, response) => {
    response.sendFile(
      path.join(
        publicPath,
        "index.html"
      )
    );
  }
);


/* ==================================================
   INICIAR SERVIDOR
================================================== */

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
      `JSON: ${projectsPath}`
    );

    console.log(
      "======================================"
    );
  }
);