
//var telegram = require('telegram');
//var _ = { each: require('lodash.foreach') };

var configDefaults = {
    bot_api_key : "",
    channel : "",
    channel_chat_id : "",
    environment: "Hi from environment",
    prepare: "Hi from prepare",
    test_pass_message: "Hi from test",
    test_fail_message: "Hi from test",
    deploy_pass_message: "===========================\n" +
    " <strong>[<%= ref.branch %>]:: <%= process.env.strider_server_name %>\n" +
    " <%= project.display_url %> </strong>\n" +
    " job <%= _id %>\n" +
    "created : <%= created %>\n" +
    "===========================\n" +
    "Deploy was successful",
    deploy_fail_message: "===========================\n" +
    " <strong>[<%= ref.branch %>]:: <%= process.env.strider_server_name %>\n" +
    " <%= project.display_url %> </strong>\n" +
    " job <%= _id %>\n" +
    "created : <%= created %>\n" +
    "===========================\n" +
    "Deploy failed"
};

var telegram_api = {
    uri : "https://api.telegram.org/bot",
    token: "",
    method: {
        update: "getUpdates",
        sendMessage:"sendMessage"
    }
}



/*
* $scope.configs, $scope.branch and $scope.pluginConfig, among others are available from the parent scope
* */
app.controller('TelegramController', ['$scope','$http', function ($scope,$http) {


    $scope.defaultConfig = function() {
        $scope.config = $scope.configs[$scope.branch.name].telegram.config || {};

        for (var key in configDefaults) {
            $scope.config[key] = configDefaults[key];
        }
    }

    $scope.fillEmptyFields = function() {
        $scope.config = $scope.configs[$scope.branch.name].telegram.config || {};
       // console.log( $scope.config.environment);
            for (var key in configDefaults) {
                 var tmpValue = $scope.config[key];
                  if (! tmpValue || tmpValue.length === 0)
                     $scope.config[key] = configDefaults[key];
            }
    }

    $scope.$watch('configs[branch.name].telegram.config', function (value) {
        $scope.config = value || configDefaults;
    });
    $scope.saving = false;
    $scope.save = function () {
        $scope.fillEmptyFields();
        $scope.saving = true;
        $scope.pluginConfig('telegram', $scope.config, function () {
            $scope.saving = false;
            //console.log($scope.configs[$scope.branch.name]);

        });

    };

    $scope.help = function () {
        $('#readme-telegram').modal().on('shown', function () {

        });
    };

   $scope.test = function () {

        //telegram_api.token = "455432713:AAFEP-9R_4mfM0HnMTf-Tx6WfAhsBCsOg1U";

       var token = $scope.config.bot_api_key;

       if(!token || token.length === 0){

           alert('Telegram Bot api token is required');

       }else {
           telegram_api.token = token;
           var channel = $scope.config.channel;
           var channel_chat_id = $scope.config.channel_chat_id;
            var chat_id = "";
           if(!channel_chat_id || channel_chat_id.length === 0){
               chat_id = channel;
           }else {
               chat_id = $scope.config.channel_chat_id;
           }

           $http.post(telegram_api.uri+telegram_api.token+"/"+telegram_api.method.sendMessage, {
               "text": "Test message from strider" , "chat_id":chat_id
           }).success(function(data, status, headers, config) {
               alert('Looks good from here. Check your Telegram!')
           }).error(function(data, status, headers, config) {
               console.log(data);
               //alert(data);
           })['finally'](function() {
               $scope.testing = false;
           });

       }


    };

    $scope.chatId = function () {

        var token = $scope.config.bot_api_key;

        if(!token || token.length === 0){
            alert('TelegramBot api token is required');
        }else {
            telegram_api.token = token;

            var channel = $scope.config.channel;

            if(!channel || channel.length === 0){
                alert("You must provide public channel name before get chat id.");
            }else {
                $http.post(telegram_api.uri+telegram_api.token+"/"+telegram_api.method.sendMessage, {
                    "text": "Test message from strider" , "chat_id":channel,
                    "disable_notification":"yes"
                }).success(function(data, status, headers, config) {
                    $scope.config['channel_chat_id'] = data.result.chat.id
                }).error(function(data, status, headers, config) {
                    alert(data.description);

                })['finally'](function() {
                    $scope.testing = false;
                });
            }
        }

    };

}]);
