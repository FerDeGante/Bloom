module.exports = {

"[externals]/stripe [external] (stripe, esm_import)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, a: __turbopack_async_module__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
const mod = await __turbopack_context__.y("stripe");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/fs [external] (fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/src/pages/success.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, a: __turbopack_async_module__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s({
    "default": (()=>Success),
    "getServerSideProps": (()=>getServerSideProps)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/stripe [external] (stripe, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Button$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/react-bootstrap/esm/Button.js [ssr] (ecmascript) <export default as Button>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__
]);
([__TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__);
;
;
;
;
;
const getServerSideProps = async ({ query })=>{
    const sessionId = query.session_id;
    if (!sessionId) {
        return {
            redirect: {
                destination: "/dashboard?tab=reservar",
                permanent: false
            }
        };
    }
    const stripe = new __TURBOPACK__imported__module__$5b$externals$5d2f$stripe__$5b$external$5d$__$28$stripe$2c$__esm_import$29$__["default"](process.env.STRIPE_SECRET, {
        apiVersion: "2025-04-30.basil"
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const m = session.metadata ?? {};
    const datesArr = JSON.parse(m.dates);
    const hoursArr = JSON.parse(m.hours);
    const therapistsArr = JSON.parse(m.therapists);
    const servicioSlug = m.servicio;
    const serviceNames = {
        agua: "Estimulación en agua",
        piso: "Estimulación en piso",
        quiropractica: "Quiropráctica",
        fisioterapia: "Fisioterapia",
        masajes: "Masajes",
        cosmetologia: "Cosmetología",
        "prevencion-lesiones": "Prevención de lesiones",
        "preparacion-fisica": "Preparación física",
        nutricion: "Nutrición",
        "medicina-rehabilitacion": "Medicina en rehabilitación",
        "terpia-post-vacuna": "Terapia post vacuna"
    };
    const servicioLabel = serviceNames[servicioSlug] ?? `Cita de ${servicioSlug}`;
    const items = datesArr.map((dateISO, i)=>{
        const [h = 0, m = 0] = (hoursArr[i] || "0:00").split(":").map((v)=>Number(v) || 0);
        const start = new Date(dateISO);
        start.setHours(h, m, 0);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const fmt = (d)=>d.toISOString().replace(/[-:]|\.\d{3}/g, "");
        const link = [
            "https://www.google.com/calendar/render?action=TEMPLATE",
            `&text=${encodeURIComponent(servicioLabel)}`,
            `&dates=${fmt(start)}/${fmt(end)}`,
            `&details=${encodeURIComponent("Terapeuta: " + therapistsArr[i])}`,
            `&location=${encodeURIComponent("Bloom Fisio")}`
        ].join("");
        const label = `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;
        return {
            dateISO,
            hourRaw: hoursArr[i],
            therapist: therapistsArr[i],
            calLink: link,
            label
        };
    });
    return {
        props: {
            items
        }
    };
};
function Success({ items }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [added, setAdded] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const handleAdd = async (idx)=>{
        const itm = items[idx];
        await fetch("/api/appointments/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                servicio: router.query.type,
                terapeuta: itm.therapist,
                date: itm.dateISO,
                hour: itm.hourRaw.replace(":00", "")
            })
        });
        setAdded((a)=>[
                ...a,
                idx.toString()
            ]);
        // Si es la última sesión, navegar a Historial
        if (added.length + 1 === items.length) {
            router.push("/dashboard?tab=historial", undefined, {
                shallow: true
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "text-center py-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: "¡Gracias por tu pago!"
            }, void 0, false, {
                fileName: "[project]/src/pages/success.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: "A continuación agrega cada sesión a tu calendario y al historial:"
            }, void 0, false, {
                fileName: "[project]/src/pages/success.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            items.map((itm, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mb-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                    children: [
                                        "Sesión ",
                                        i + 1,
                                        ":"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/pages/success.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this),
                                " ",
                                itm.label,
                                " — ",
                                itm.therapist
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/success.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$bootstrap$2f$esm$2f$Button$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            className: "btn-orange me-2 mb-2",
                            onClick: ()=>handleAdd(i),
                            disabled: added.includes(i.toString()),
                            children: added.includes(i.toString()) ? "✔ Agregada" : `➕ Agregar sesión ${i + 1}`
                        }, void 0, false, {
                            fileName: "[project]/src/pages/success.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                            href: itm.calLink,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "btn btn-primary mb-2",
                            children: "Añadir a Calendar"
                        }, void 0, false, {
                            fileName: "[project]/src/pages/success.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/pages/success.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/pages/success.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__8ac2c061._.js.map