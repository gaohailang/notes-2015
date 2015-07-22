/*
"url": "git@github.com:okor/justice.git"
"description": "Embedable script for displaying web page performance metrics.",
*/

include
    justice.cache：变量保存和全局变量申明
    mungers：打杂的譬如 mergeOptions, setActiveMetrics（from options）
    collectors: 性能采集的方法（通过 timing, performance API 和 requestFrame 回调中计算 fps，出入 history）
    render：DOM， 模板渲染连接 Concat

在 init 中：
检查是否有支持的 API，然后在 window.onload 调 seriousInit

在 seriousInit 中：
timing = window.performance.timing
options = mergeOptions(opts)
setActiveMetrics(options, activeMetrics, avaiableMetrics);
renderUI()
fpsRender = getFpsRenderer(options.chartType)
window.requestAnimationFrame(tick);

在 tick 中：
tickCount++
if(options.showFPS) {
    trackFPS(time)
    fpsRenderder(
        domDisplayChartFpsCanvasCtx,
        domDisplayChartFpsCanvas,
        dataFpsHistory
    )
}
lastTextUpdate = time if (diff) > 3000:
    renderText()
window.requestAnimationFrame(tick)


在 justice.render.js 中：
    renderUI函数：
    wrap (document.createElement('div').id=prefix.classList.add(prefix).add(stateClass))
    document.body.appendChild(wrap)
    wrap.innerHTML = [
        '<div id=xx-toggle>',
        getAllTextMetricsHTML(),
        getAllChartMetricsHTML()
    ].join('');
    if(options.showFPS) cacheLookups()
    attachListeners() // toggle 来 open/closed class op

    renderText 函数：
    更换 text-metrics 的 html 为 getAllTextMetricsHTML(activeMetrics)

在 justice.render.utils.js 中：
    function getSingleTextMetricHtml (metricKey, metric, budget) {
        var metricValue = metric.collector()
        var ratingClass = getMetricRatingClass(metricValue, budget);

        return [
            // DOM HTML
        ].join('');
    }

    function getMetricRatingClass(metricValue, metricBudget) {
        var rating = '';
        if(metricValue > metricBudget){
            rating = 'fail'
        } else if (metricValue > (metricBudget*options.warnThreshold)) {
            rating = 'warn';
        } else {
            rating = 'pass';
        }
        return rating;
    }

在 justice.render.chart 中：
    里面有 renderChart 的逻辑（canvas 相关）

在 justice.mungers.js 中：
    mergeOptions
    setActiveMetrics:
        for(var k in options.metrics) {
            activeMetrics[k] = avaiableMetrics[k];
        }

在 justice.collectors.js 中：
    function trackFPS (time) {
        if(!dataFpsLastTime) {
            dataFpsLastTime = time; // first time
        } else {
            var delta = (time - dataFpsLastTime) / 1000;
            var fps = 1/delta;
            var fpsClipped = Math.floor(fps > 60 ? 60: fps);
            dataFpsCurrent = fpsClipped;
            dataFpsHistory.push([fpsClipped, fpsClipped])
            if(dataFpsHistory.length > maxHistory) {
                dataFpsHistory.shift()
            }
            dataFpsLastTime = time;
        }
    }

在 justice.cache.js 中：
    保存了一些变量：
    如 colors
    如 prefix='justice', maxWidth, maxHeight
    如 FPS 的一些变量
    如 dom 变量
    如 默认参数 metrics, interface, 等

    var avaiableMetrics = {
        pageLoad: {
            id: prefix+'-load',
            label: 'Load',
            unitLabel: 'ms',
            collector: function getLoadTime() {
                return timing.loadEventStart - timing.navigationStart;
            }
        },
        domComplete: {
            collector: function getDomComplete() {
                return timing.domComplete - timing.domLoading;
            }
        },
        numRequests: function getNumRequests() {
            if(performance.getEntries) {
                return performance.getEntries.length;
            } else {
                return '¯\\_(ツ)_/¯';
            }
        }
    }

justice 的 DOM 结构：
    #justice.justice.open
        #.justice-toggle
        #justice-text-metrics.justice-metric-wrap
            .justice-metric#justice-<requests,load,complete,interactive>
        .justice-metric.chart
            .justice-title
            canvas.justice-canvas


