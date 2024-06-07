/*
 * @Author: shuoshubao
 * @Date: 2024-06-03 19:34:25
 * @LastEditors: shuoshubao
 * @LastEditTime: 2024-06-07 16:37:51
 * @Description:
 */
import react from '@vitejs/plugin-react';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import { name, version } from './package';

export default ({ mode }) => {
    const isDevelopment = mode === 'development';
    return {
        base: isDevelopment ? '/' : `https://unpkg.com/${name}@${version}/dist/`,
        build: {
            assetsDir: '.',
            rollupOptions: {
                output: {
                    entryFileNames: `[name].js`,
                    assetFileNames: `[name].[ext]`
                }
            }
        },
        plugins: [
            react(),
            viteExternalsPlugin({
                react: 'React',
                'react-dom': 'ReactDOM',
                dayjs: 'dayjs',
                antd: 'antd'
            })
        ]
    };
};
