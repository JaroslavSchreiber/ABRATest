const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.tsx', // Váš entry point
    devtool: 'inline-source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname,'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader', // Použi ts-loader na kompiláciu TypeScriptu
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },

            {
                test: /\.(png|jp(e*)g|svg)$/,
                type: "asset/resource"
            },
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
      //contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 3000,
      historyApiFallback: true, // Toto řeší problém s React Routerem
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      open:true
    }
};