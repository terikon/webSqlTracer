module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.initConfig({
		uglify: {
			target1: {
				options: {
					sourceMap: true
				},
				src: 'webSqlTracer.js',
				dest: 'dist/webSqlTracer.min.js'
			}
		}
	});
	
	grunt.registerTask('default', ['uglify']);
};