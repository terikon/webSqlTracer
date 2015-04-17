module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			options: {
				sourceMap: true,
				banner: '/* <%= grunt.task.current.target %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> (C) 2015 Terikon Software */\n'
			},
			
			webSqlTracer: {
				src: 'webSqlTracer.js',
				dest: 'dist/webSqlTracer.min.js'
			}
		},
		jshint: {
			all: ['Gruntfile.js', 'webSqlTracer.js']
		}
	});
	
	grunt.registerTask('default', ['uglify']);
};