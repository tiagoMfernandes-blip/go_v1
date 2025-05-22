const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/coingecko',
    createProxyMiddleware({
      target: 'https://api.coingecko.com/api/v3',
      changeOrigin: true,
      pathRewrite: {
        '^/api/coingecko': ''
      },
      onProxyRes: function(proxyRes, req, res) {
        // Adicionar headers para permitir CORS
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
}; 