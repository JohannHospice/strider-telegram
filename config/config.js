'use strict';

var app = window.app;
var configDefaults = {
  environment: 'Hi from `environment`',
  prepare: 'Hi from `prepare`',
  test: 'Hi from `test`',
  deploy: 'Hi from `deploy`',
  cleanup: 'Hi from `cleanup`'
};

/*
* $scope.configs, $scope.branch and $scope.pluginConfig, among others are available from the parent scope
* */
app.controller('TemplateController', ['$scope', function ($scope) {
	$scope.saving = false;

	$scope.$watch('configs[branch.name].strider-telegram.config', function (value) {
		$scope.config = value || configDefaults;
	});

	$scope.save = function () {
		$scope.saving = true;
		$scope.pluginConfig('template', $scope.config, function () {
			$scope.saving = false;
		});
	};
}]);
