# 🇨🇴 Calculadora de Indemnizaciones y Liquidación Laboral (Colombia - CST)

Aplicación web interactiva desarrollada en **Angular** para calcular liquidaciones definitivas de contrato e indemnizaciones por despido (injustificado, justificado o renuncia), con fórmulas desglosadas en tiempo real conforme al **Código Sustantivo del Trabajo (CST)**, Ley 789 de 2002, Ley 15 de 1959 y normas concordantes de Colombia.

🌐 **Demo Pública en GitHub Pages:**  
👉 **[https://Jorge-tec.github.io/salary-calculator_educational-resources/](https://Jorge-tec.github.io/salary-calculator_educational-resources/)**

---

## 📋 Características Principales

1. **Cálculo de Indemnizaciones por Despido (Art. 64 CST)**:
   - **Término Indefinido (&lt; 10 SMMLV):** 30 días de salario por el 1er año + 20 días por año subsiguiente o fracción proporcional.
   - **Término Indefinido (≥ 10 SMMLV):** 20 días de salario por el 1er año + 15 días por año subsiguiente o fracción proporcional.
   - **Término Fijo:** Salarios correspondientes al tiempo faltante para cumplir el plazo pactado.
   - **Obra o Labor:** Salarios del tiempo faltante para culminar la labor (mínimo legal de 15 días).
   - **Despido con Justa Causa (Art. 62 CST) o Renuncia Voluntaria:** Liquidación completa de derechos ciertos sin indemnización ($0 COP).

2. **Liquidación de Prestaciones Sociales (Año Comercial 360 Días)**:
   - **Cesantías (Art. 249 CST):** `(Salario Base + Aux. Transp) × Días año ÷ 360`
   - **Intereses sobre Cesantías (Ley 52 de 1975):** `(Cesantías × Días año × 12%) ÷ 360`
   - **Prima de Servicios (Art. 306 CST):** `(Salario Base + Aux. Transp) × Días semestre ÷ 360`
   - **Vacaciones (Art. 186 y 192 CST):** `Salario Base × Días ÷ 720` *(excluye auxilio de transporte por mandato legal)*
   - **Salarios pendientes** adeudados al retiro.

3. **Régimen Estricto de Auxilio de Transporte (Ley 15 de 1959)**:
   - **Salarios > 2 SMMLV:** Inhabilitado y bloqueado automáticamente ($0 COP) por prohibición legal.
   - **Salarios ≤ 2 SMMLV:** Opcional según modalidad del contrato (Teletrabajo / Trabajo en casa Ley 2088/2020, suministro de ruta empresarial o trabajador residente en el sitio).

4. **Panel Didáctico de Fórmulas y Artículos CST**:
   - Muestra la sustitución matemática exacta con los valores del caso ingresado.
   - Pestaña de consulta con el texto legal de los artículos del CST.

5. **Tabla Organizacional Multi-Caso**:
   - Guarda, compara y gestiona múltiples liquidaciones en almacenamiento local (`localStorage`).
   - Exportación de registros a formato **CSV / Excel**.
   - Carga con 1 clic de casos al formulario para edición o re-evaluación.

6. **Acta Formal Imprimible / Generador de PDF**:
   - Formato oficial con membrete, desglose, declaración de Paz y Salvo laboral y bloque de firmas con huella dactilar.

---

## ⚙️ Despliegue Automático en GitHub Pages

El proyecto incluye un flujo de trabajo automatizado en `.github/workflows/deploy.yml`.

### Pasos para activar en GitHub:
1. En GitHub, ve a tu repositorio: `Jorge-tec/salary-calculator_educational-resources`.
2. Dirígete a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En la sección **Build and deployment** > **Source**, selecciona:  
   👉 **GitHub Actions**
4. Cada vez que se haga un `git push` a la rama `main`, la aplicación se compilará y publicará automáticamente en:
   `https://Jorge-tec.github.io/salary-calculator_educational-resources/`

---

## 🛠️ Comandos Locales

- **Iniciar servidor local de desarrollo:**
  ```bash
  npm start
  # Abrir http://localhost:4200
  ```

- **Compilar para producción estándar:**
  ```bash
  npm run build
  ```

- **Compilar con ruta base para GitHub Pages:**
  ```bash
  npm run build:gh-pages
  ```

---

## ⚠️ Descargo de Responsabilidad (Disclaimer)
Esta aplicación es una herramienta informática desarrollada con fines exclusivamente pedagógicos, informativos y de simulación referencial. No sustituye la asesoría jurídica laboral personalizada ni los pronunciamientos emitidos por el Ministerio del Trabajo de Colombia o los jueces de la República.
