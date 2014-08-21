/**
 * Created by dam on 2014/7/30.
 */
(function($) {
    $.fn.tbcVideo = function(options) {
        var player_params = {
            videoPath: '',
            courseId: '',
            scoId:'',
            isComplete:false,
            serviceUrl:'',
            viewMode:'',
            locationTime:'',
            rate:80,
            flashPlayerUrl:''
        };
        var opts = $.extend(player_params, options);
        var videoSupport = function checkVideo() {
            if (!!document.createElement('video').canPlayType) {
                var vidTest = document.createElement("video");
                oggTest = vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');
                if (!oggTest) {
                    h264Test = vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
                    if (!h264Test) {
                        return false;
                    }else {
                        if (h264Test == "probably") {
                            return true;
                        }else {
                            return false;
                        }
                    }
                }else {
                    if (oggTest == "probably") {
                        return true;
                    }else {
                        return false;
                    }
                }
            }else {
                return false;
            }
        }
        var videoFlvHtml = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
            +'id="elnFlvPlayer" width="100%" height="100%"'
            +'codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">'
            +'<param name="wmode" value="transparent">'
            +'<param name="FlashVars" value="videoPath='+player_params.videoPath
            +'&amp;isComplete='+player_params.isComplete
            +'&amp;courseId='+player_params.courseId
            +'&amp;scoId='+player_params.scoId
            +'&amp;serviceUrl='+player_params.serviceUrl+'&amp;viewMode='+player_params.viewMode+'&amp;locationTime='+player_params.location
            +'&amp;rate='+player_params.rate+'" />'
            +'<param name="movie" value="'+player_params.flashPlayerUrl+'" />'
            +'<param name="quality" value="high" />'
            +'<param name="bgcolor" value="#869ca7" />'
            +'<param name="allowFullScreen" value="true" />'
            +'<param name="allowScriptAccess" value="sameDomain" />'
            +'<embed swliveconnect="true" name="elnFlvPlayer" wmode="transparent"'
            +'src="'+player_params.flashPlayerUrl+'" '
            +'FlashVars="videoPath='+player_params.videoPath
            +'&amp;courseId='+player_params.courseId+'&amp;scoId='+player_params.scoId
            +'&amp;isComplete='+player_params.isComplete
            +'&amp;serviceUrl='+ player_params.serviceUrl+'&amp;viewMode='+player_params.viewMode+'&amp;locationTime='+player_params.location
            +'&amp;rate='+player_params.rate+'"'
            +'quality="high" bgcolor="#869ca7"'
            +'width="100%" height="100%" align="middle"'
            +'play="true"'
            +'loop="false"'
            +'quality="high"'
            +'allowScriptAccess="sameDomain"'
            +'allowFullScreen="true"'
            +'type="application/x-shockwave-flash"'
            +'pluginspage="http://www.adobe.com/go/getflashplayer">'
            +'</embed>';

        if(videoSupport() == false){//如果不支持html5video标签，则使用flash播放器
            return this.each(function(){
                var $tbcVideo = $(this);
                $tbcVideo.replaceWith(videoFlvHtml);
            });
        }else{
            var videoPathValue = player_params.videoPath.toLowerCase();
            if(videoPathValue.indexOf(".flv") != -1){//如果是传的flv文件，则还是要使用flash播放器
                var $tbcVideo = $(this);
                $tbcVideo.replaceWith(videoFlvHtml);
            }
        }
        return this.each(function(){
            var $tbcVideo = $(this);
            //$tbcVideo.children('source').attr('src',player_params.videoPath);
            //为媒体播放器应用样式主题
            var $video_wrap = $('<div></div>').addClass('video-player').addClass(options.theme).addClass(options.childtheme);
            var $video_seek = $('<div class="video-seek"></div>');
            //书写控制条
            var $video_controls = $('<div class="video-controls">' +
                '<a class="video-play" title="播放/暂停"></a>' +
                '<div class="video-timer">00:00</div>' +
                '<div class="full-screen-button">全屏</div>' +
                '<div class="volume-slider"></div>' +
                '<a class="volume-button" title="静音/取消静音"></a>'+
                '</div>');
            $tbcVideo.wrap($video_wrap);
            $tbcVideo.after($video_seek);
            $video_seek.after($video_controls);

            var $video_container = $tbcVideo.parent('.video-player');
            var $video_controls = $('.video-controls', $video_container);
            var $play_btn = $('.video-play', $video_container);
            //var $video_seek = $('.video-seek', $video_container);
            var $video_timer = $('.video-timer', $video_container);
            var $volume = $('.volume-slider', $video_container);
            var $volume_btn = $('.volume-button', $video_container);

            $video_controls.show(); //暂时不隐藏自定义控制条

            var vPlay = function() {//播放/暂停按钮函数
                if($tbcVideo.prop('paused') == false) {
                    $tbcVideo[0].pause();
                }
                else {
                    $tbcVideo[0].src = player_params.videoPath;
                    $tbcVideo[0].play();
                }
            };
            $play_btn.click(vPlay);
            $tbcVideo.click(vPlay);

            $tbcVideo.bind('play', function() {
                $play_btn.addClass('paused-button');
            });

            $tbcVideo.bind('pause', function() {
                $play_btn.removeClass('paused-button');
            });

            $tbcVideo.bind('ended', function() {
                $play_btn.removeClass('paused-button');
            });
            var seeksliding;
            var vSliderSeek = function() {//进度条
                if($tbcVideo.prop('readyState')) {
                    var video_duration = $tbcVideo.prop('duration');
                    $video_seek.slider({
                        value: 0,
                        step: 0.01,
                        orientation: "horizontal",
                        range: "min",
                        max: video_duration,
                        animate: true,
                        slide: function(){
                            seeksliding = true;
                        },
                        stop:function(e,ui){
                            seeksliding = false;
                            $tbcVideo.prop("currentTime",ui.value);
                        }
                    });
                    //$video_controls.show();
                }else {
                    setTimeout(vSliderSeek, 150);
                }
            };
            vSliderSeek();
            //时间显示
            var vTimeFormat=function(seconds){
                var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
                var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
                return m+":"+s;
            };

            var seekUpdate = function() {
                var currenttime = $tbcVideo.prop('currentTime');
                if(!seeksliding) $video_seek.slider({ value: currenttime });
                $video_timer.text(vTimeFormat(currenttime));
            };

            $tbcVideo.bind('timeupdate', seekUpdate);

            //音量控制
            $volume.slider({
                value: 1,
                orientation: "horizontal",
                range: "min",
                max: 1,
                step: 0.05,
                animate: true,
                slide:function(e,ui){
                    $tbcVideo.prop('muted',false);
                    video_volume = ui.value;
                    $tbcVideo.prop('volume',ui.value);
                }
            });

            var muteVolume = function() {
                if($tbcVideo.prop('muted')==true) {
                    $tbcVideo.prop('muted', false);
                    $volume.slider('value', video_volume);
                    $volume_btn.removeClass('volume-mute');
                }
                else {
                    $tbcVideo.prop('muted', true);
                    $volume.slider('value', '0');
                    $volume_btn.addClass('volume-mute');
                };
            };

            $volume_btn.click(muteVolume);

            $tbcVideo.remove('controls');

        });
    };
})(jQuery);