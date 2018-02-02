'use strict';
var ejs = require('ejs'), _ = require('lodash');
var axios = require('axios');

var telegram_api = {
    uri : "https://api.telegram.org/bot",
    token: "",
    method: {
        update: "getUpdates",
        sendMessage:"sendMessage"
    }

}

/* Functions for demonstration purposes only */
function checkSomething(context, callback){
	//Do something here, then call back
	callback(true);
};

function doThings(callback){
	callback(null);
};

module.exports = {
	// Initialize the plugin for a job
	//   config: the config for this job, made by extending the DB config
	//           with any flat-file config
	//   job:    see strider-runner-core for a description of that object
	//   context: currently only defines "dataDir"
	//   cb(err, initializedPlugin)
  init: function (config, job, context, cb) {
		return cb(null, {
			// any extra env variables. Will be available during all phases
			env: {},
			// Listen for events on the internal job emitter.
			//   Look at strider-runner-core for an
			//   enumeration of the events. Emit plugin.[pluginid].myevent to
			//   communicate things up to the browser or to the webapp.
			listen: function (emitter, context) {

                var phase = null;
                function onDeployError(id, data) {
                    try {
                        var compile = function (tmpl) {
                            return ejs.compile(tmpl)(_.extend(job, {
                                _: _ // bring lodash into scope for convenience
                            }))
                        };

                        var data = {
                            text : compile(config.deploy_fail_message),
                            chat_id: config.channel_chat_id,
                            disable_web_page_preview: false,
                            parse_mode: "HTML"
                        }
                        axios.post(telegram_api.uri+config.bot_api_key+"/"+telegram_api.method.sendMessage, data)
                            .then(function (response){
                                console.log(response.data);
                            })
                            .catch (function (error) {
                                console.log(error);
                            });

                    }catch (e){
                        console.error(e.stack)
                    }
                    cleanup();
                }
                function onPhaseDone(id, data) {
                    phase = data.phase;
                    if (phase === "deploy") {
                        try {
                            var compile = function (tmpl) {
                                return ejs.compile(tmpl)(_.extend(job, {
                                    _: _ // bring lodash into scope for convenience
                                }))
                            };

                            var data = {
                                text : compile(config.deploy_pass_message),
                                chat_id: config.channel_chat_id,
                                disable_web_page_preview: false,
                                parse_mode: "HTML"
                            }
                            axios.post(telegram_api.uri+config.bot_api_key+"/"+telegram_api.method.sendMessage, data)
                                    .then(function (response){
                                    console.log(response.data);
                            })
                            .catch (function (error) {
                                console.log(error);
                            });

                        }catch (e){
                            console.error(e.stack)
						}

                       // slackPOST(io, job, data, context, config, phase)
						//console.log("Telegram Done "+phase);
                        if (data.next === "deploy") {
                            emitter.on('job.status.phase.errored', onDeployError);
                        } else {
                            cleanup();
                        }
                    }
                }
				emitter.on('job.status.phase.done',onPhaseDone);
                emitter.on('job.status.cancelled', cleanup);

                function cleanup() {
                    emitter.removeListener('job.status.phase.done', onPhaseDone);
                    emitter.removeListener('job.status.phase.errored', onDeployError);
                    emitter.removeListener('job.status.cancelled', cleanup);
                }
			}
		});
	},
	// this is only used if there is _no_ plugin configuration for a
	// project. See gumshoe for documentation on detection rules.
	autodetect: {
		filename: 'package.json',
		exists: true
	}
};
