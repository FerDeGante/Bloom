module.exports = {

"[project]/.next-internal/server/app/servicios/[id]/page/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[project]/src/app/layout.js [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.js [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/servicios/[id]/page.jsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/app/servicios/[id]/page.jsx
__turbopack_context__.s({
    "default": (()=>ServicePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
;
;
;
const serviciosData = {
    agua: {
        title: "Estimulación en agua",
        desc: "Terapias en piscina climatizada para mejorar movilidad y fuerza.",
        price: 500,
        priceId: "prod_SE5A5p5uqHwogE"
    },
    piso: {
        title: "Estimulación en piso",
        desc: "Ejercicios especializados sobre suelo para el desarrollo motor.",
        price: 500,
        priceId: "prod_SE5CwnHzEk8V5d"
    },
    quiropractica: {
        title: "Quiropráctica",
        desc: "Ajustes espinales para aliviar tensiones y mejorar postura.",
        price: 500,
        priceId: "prod_SE5DojRCwzy37u"
    },
    fisioterapia: {
        title: "Fisioterapia",
        desc: "Tratamientos para aliviar dolor y recuperar funcionalidad.",
        price: 500,
        priceId: "prod_SE5DjxqnOLySxb"
    },
    masajes: {
        title: "Masajes",
        desc: "Masajes terapéuticos para relajar músculos y mejorar circulación.",
        price: 500,
        priceId: "prod_SE5EcuLUlnoMo9"
    },
    cosmetologia: {
        title: "Cosmetología",
        desc: "Tratamientos estéticos para cuidado de la piel y rejuvenecimiento.",
        price: 500,
        priceId: "prod_SE5EcuLUlnoMo9"
    },
    "prevencion-lesiones": {
        title: "Prevención de lesiones",
        desc: "Programas personalizados para evitar lesiones deportivas.",
        price: 500,
        priceId: "prod_SE5FkWctKX0y6L"
    },
    "preparacion-fisica": {
        title: "Preparación física",
        desc: "Planes de acondicionamiento para mejorar rendimiento deportivo.",
        price: 500,
        priceId: "prod_SE5G5MaqIKWCWe"
    },
    nutricion: {
        title: "Nutrición",
        desc: "Asesoría nutricional para tu salud y bienestar integral.",
        price: 500,
        priceId: "prod_SE5ISPGdSltSux"
    },
    "medicina-rehabilitacion": {
        title: "Medicina en rehabilitación",
        desc: "Soporte médico especializado durante tu proceso de rehabilitación.",
        price: 500,
        priceId: "prod_SE5JOO0qaMuOKK"
    }
};
function ServicePage({ params }) {
    const { id } = params;
    const servicio = serviciosData[id];
    if (!servicio) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    // URL al scheduler de Easy!Appointments
    const eaUrl = `${("TURBOPACK compile-time value", "http://localhost")}/index.php?controller=Appointment&action=new&service_id=${id}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container py-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "display-6 mb-3",
                children: servicio.title
            }, void 0, false, {
                fileName: "[project]/src/app/servicios/[id]/page.jsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-4",
                children: servicio.desc
            }, void 0, false, {
                fileName: "[project]/src/app/servicios/[id]/page.jsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card p-4 shadow-sm mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "h5",
                    children: [
                        "Costo de la sesión: $",
                        servicio.price,
                        ".00 MXN"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/servicios/[id]/page.jsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/servicios/[id]/page.jsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: eaUrl,
                className: "btn btn-primary",
                target: "_blank",
                rel: "noopener noreferrer",
                children: "Agendar mi cita"
            }, void 0, false, {
                fileName: "[project]/src/app/servicios/[id]/page.jsx",
                lineNumber: 86,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/servicios/[id]/page.jsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/app/servicios/[id]/page.jsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/servicios/[id]/page.jsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=_3ea931c8._.js.map