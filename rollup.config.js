import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-porter';

export default [
    {
        input: 'src/index.js',        
        output: { 
            file: 'public/main.js',
            format: 'iife',
            sourcemap: true,
            name: 'Test',
            globals: {
                'leaflet': 'L'
            },
        },
        plugins: [                      
            resolve({
				preferBuiltins: false
            }),
            commonjs(),            
            css({dest: 'public/main.css', minified: false}),
            babel({                
                extensions: ['.js'],
                exclude: ['node_modules/@babel/**', 'node_modules/core-js/**']
            }),
        ],
    }
];