module.exports = {

"[externals]/@stripe/stripe-js [external] (@stripe/stripe-js, cjs, async loader)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/[externals]_@stripe_stripe-js_c01f37fd._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/@stripe/stripe-js [external] (@stripe/stripe-js, cjs)");
    });
});
}}),

};