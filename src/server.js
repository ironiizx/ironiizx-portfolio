"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;

const publicPath = path.join(
  __dirname,
  "..",
  "public"
);

const projectsPath = path.join(
  __dirname,
  "..",
  "data",
  "projects.json"
);

app.disable("x-powered-by");

// API de proyectos

app.get("/api/projects", async (req, res) => {
  try {
    const fileContent = await fs.readFile(
      projectsPath,
      "utf8"
    );

    const projects = JSON.parse(fileContent);

    if (!Array.isArray(projects)) {
      return res.status(500).json({
        message:
          "projects.json debe contener un array."
      });
    }

    res.set(
      "Cache-Control",
      "no-store"
    );

    return res.json(projects);
  } catch (error) {
    console.error(
      "Error al cargar los proyectos:",
      error
    );

    return res.status(500).json({
      message:
        "No se pudieron cargar los proyectos."
    });
  }
});

// Página principal

app.get("/", (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache"
  );

  return res.sendFile(
    path.join(
      publicPath,
      "index.html"
    )
  );
});

// Archivos públicos

app.use(
  express.static(publicPath, {
    etag: true,

    maxAge:
      process.env.NODE_ENV === "production"
        ? "1h"
        : 0
  })
);

// Rutas API inexistentes

app.use("/api", (req, res) => {
  return res.status(404).json({
    message:
      "La ruta solicitada no existe."
  });
});

// Servidor local

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `Servidor iniciado en http://localhost:${PORT}`
    );

    console.log(
      `API disponible en http://localhost:${PORT}/api/projects`
    );
  });
}

// Exportación para Vercel

module.exports = app;