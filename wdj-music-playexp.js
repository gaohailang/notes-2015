



function bindEvent() {
    // loadedmetadata, durationchange
    audioDom.addEventListener('play', function () {
        console.log('audioDom.onPlay', arguments);

        wdjNative.sendPlay();
    });
}

// 播放相关方法，暴露给 Native
extend(wdjNative, {
    sendPause: function () {
        console.log('wdjNative.sendPause', arguments);

        window.NativeCallback.sendToNative('onpause', JSON.stringify({
            isUser: true
        }));
    }
});

// 播放相关方法，暴露给 Native
extend(wdjAudio, {
    play: function() {
        // log
        isNativeControlledPlay = true;
        audioDom.play();
    }
});

function getAudioDom() {
    if source == 'xiami' {
        audioDom = window.xiami.audio;
    }

    audioDom = audioDom||document,documentElement.getElementsByTagName('audio')[0]; // querySelector('audio')
    if(audioDom) {
        bindEvent();
        simulatedClick();// play audio auto
    } else {
        if(AUDIO_TIMER++ < MAX_AUDIO_TIME) {
            setTimeout(getAudioDom, 200);
        } else {
            // collection info
            wdjNative.sendError('timeout', infos.join(','));
        }
    }
}

function simulatedClick() {
    var mayBeEle = document.querySelector('#detailBox a');
    var custEvent = document.createEvent('MouseEvents');
    custEvent.initEvent('click', false, false);
    mayBeEle.dispatchEvent(custEvent);

    if(audioDom.paused) {
        audioDom.play();
    }
}

// utils
// 改写 QQ 音乐下载按钮的逻辑，使其点击时不暂停音乐播放
var hackQQDownload = function() {
    var el = document.getElementById('lrc_js');
    elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);

    document.getElementById('lrc_js').addEventListener('click', function() {
        window.downQQMusic();
    });
}

// 通过快进的方法获取 duration
// @Todo: xxx
function getDuration() {
    if(!audioDom.currentTime) {
        return setTimeout(getDuration, 100);
    }
    audioDom.currentTime += length;
    Math.max(audioDom.currentTime, audioDom.duration);
    // 缓冲，造成duration 不一定式真实的值
}

getAudioDom();