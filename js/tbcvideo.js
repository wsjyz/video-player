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
        this.data("param",player_params);
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
            +'</embed></object>';

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
        var $tbcVideo = this;
        var initialVideo = function () {
            $tbcVideo.addClass("video-initial-size");
            $tbcVideo.prop("preload", "none");
            $tbcVideo.prop("src", player_params.videoPath);
            $tbcVideo.prop("poster", "images/logo.png");
        }
        //初始化video标签
        initialVideo();
        //$tbcVideo.children('source').attr('src',player_params.videoPath);
        //为媒体播放器应用样式主题
        var $video_wrap = $('<div></div>').addClass('video-player').addClass(options.theme).addClass(options.childtheme);
        var $video_seek = $('<div class="video-seek"></div>');
        var $posterPlayButton = $("<div class='poster-play-button'></div>")
        //书写控制条
        var $video_controls = $('<div class="video-controls">' +
            '<a class="video-play" title="播放/暂停"></a>' +
            '<span class="video-timer">00:00</span>' +
            '<div class="full-screen-button">全屏</div>' +
            '<div class="volume-slider"></div>' +
            '<a class="volume-button" title="静音/取消静音"></a>' +
            '</div>');
        $tbcVideo.wrap($video_wrap);
        $tbcVideo.before($posterPlayButton);
        $video_controls.append($video_seek);
        $tbcVideo.after($video_controls);

        var $video_container = $tbcVideo.parent('.video-player');
        var $video_controls = $('.video-controls', $video_container);
        var $play_btn = $('.video-play', $video_container);
        var $video_seek = $('.video-seek', $video_container);
        var $video_timer = $('.video-timer', $video_container);
        var $volume = $('.volume-slider', $video_container);
        var $volume_btn = $('.volume-button', $video_container);
        var $video_full_screen = $('.full-screen-button', $video_container);

       // $video_controls.show(); //暂时不隐藏自定义控制条

        var vPlay = function () {//播放/暂停按钮函数
            if ($tbcVideo.prop('paused') == true) {
                $tbcVideo[0].play();
            }
            else {
                $tbcVideo[0].pause();
            }
            $posterPlayButton.removeClass("poster-play-button")
        };
        $play_btn.click(vPlay);
        $tbcVideo.click(vPlay);
        $posterPlayButton.click(vPlay)

        $tbcVideo.bind('play', function () {
            $play_btn.addClass('paused-button');
        });

        $tbcVideo.bind('pause', function () {
            $play_btn.removeClass('paused-button');
        });

        $tbcVideo.bind('ended', function () {
            $play_btn.removeClass('paused-button');
        });
        var seeksliding;
        var vSliderSeek = function () {//进度条
            if ($tbcVideo.prop('readyState')) {
                var video_duration = $tbcVideo.prop('duration');
                $video_seek.slider({
                    value: 0,
                    step: 0.01,
                    orientation: "horizontal",
                    range: "min",
                    max: video_duration,
                    animate: true,
                    slide: function () {
                        seeksliding = true;
                    },
                    stop: function (e, ui) {
                        seeksliding = false;
                        var currentTime = $tbcVideo.prop("currentTime");
                        if(player_params.viewMode == 'normal'){
                            if(ui.value > currentTime){
                                $(this).slider({value:currentTime})
                            }else{
                                $tbcVideo.prop("currentTime", ui.value)
                            }
                        }else{
                            $tbcVideo.prop("currentTime", ui.value);
                        }
                    }
                });
            } else {
                setTimeout(vSliderSeek, 150);
            }
        };
        vSliderSeek();
        //时间显示
        var vTimeFormat = function (seconds) {
            var m = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
            var s = Math.floor(seconds - (m * 60)) < 10 ? "0" + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));
            return m + ":" + s;
        };

        var seekUpdate = function () {
            var currenttime = $tbcVideo.prop('currentTime');
            var durationTime = $tbcVideo.prop("duration")
            if (!seeksliding) $video_seek.slider({ value: currenttime });
            if (durationTime) {
                $video_timer.text(vTimeFormat(currenttime) + "/" + vTimeFormat(durationTime));
            } else {
                $video_timer.text(vTimeFormat(currenttime));
            }
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
            slide: function (e, ui) {
                $tbcVideo.prop('muted', false);
                video_volume = ui.value;
                $tbcVideo.prop('volume', ui.value);
                if (video_volume < .5) {
                    $volume_btn.addClass("volume-button-small");
                } else {
                    $volume_btn.removeClass("volume-button-small");
                }
            }
        });
        var video_volume = 1
        var muteVolume = function () {
            if ($tbcVideo.prop('muted') == true) {
                $tbcVideo.prop('muted', false);
                $volume.slider('value', video_volume);
                $volume_btn.removeClass('volume-mute');
            }
            else {
                $tbcVideo.prop('muted', true);
                $volume.slider('value', '0');
                $volume_btn.addClass('volume-mute');
            }
            ;
        };

        $volume_btn.click(muteVolume);

        $tbcVideo.remove('controls');
        //进入全屏
        var launchFullScreen = function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
        //退去全屏
        var cancelFullScreen = function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        //是否全屏
        var videoFullScreen = false;
        $video_full_screen.click(function () {
            if (videoFullScreen) {
                videoFullScreen = false;
                cancelFullScreen();
                $video_container.removeClass("video-player-full-screen");
            } else {
                videoFullScreen = true;
                launchFullScreen($video_container[0])
                $video_container.addClass("video-player-full-screen");
            }
        });

        //绑定屏幕变化事件
        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (event) {
            if (!(document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement)) {
                videoFullScreen = false;
                $video_container.removeClass("video-player-full-screen");
            }
        })

        //2秒鼠标不同隐藏控制条
        var hidemouse;
        $(document).mousemove(function () {
            clearTimeout(hidemouse);
            $(".video-controls").fadeIn("slow");
            hidemouse = setTimeout("$('.video-controls').fadeOut('slow')", 2000);
        });
        //浏览器关闭触发保存进度事件
        $(window).bind("beforeunload",function(){
            $tbcVideo.saveVideoLocation();
        })

        //向外暴露的工具函数
        $.fn.extend({
            playToggle:function(){
                if (this.prop('paused') == true) {
                    this[0].play();
                }
                else {
                    this[0].pause();
                }
                this.prev().removeClass("poster-play-button")
            },
            getPlayerHeadTime:function(){
                return Math.floor(this.prop("currentTime"));
            },
            getPlayerTotalTime:function(){
                return Math.floor(this.prop("duration"));
            },
            getPlayerState:function(){
                if (this[0].paused) {
                    return "paused"
                } else if (this[0].played) {
                    return "played";
                }else{
                    return "readyed";
                }
            },
            saveVideoLocation: function () {
                var serviceUrl = this.data("param").serviceUrl;
                $.post(serviceUrl,{});

            }

        });

        return this;
    };
})(jQuery);