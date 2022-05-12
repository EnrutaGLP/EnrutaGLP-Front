module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = "Chronos";
                return args;
            })
    },
    transpileDependencies: [
        'vuetify'
    ]
}
