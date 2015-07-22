a memory leak, a gradual loss of memory
when a program repeatedly fails to return memory it has obtained for temporary use
to deal with garbage collection pauses

avoid holding reference to DOM elements you no longer need to use
unbind uneeded event listeners
aware when storing large chunks of data you aren't going to use


if you are GCing frequently, you may be allocating too frequently.


Todo: 回去做下性能测试：看看 popup/modal 没有remove(element.remove(), 和scope.$destroy())，对性能和内存的影响

Todo: 打包相关的准备（ngtemplate, ng-annotation

Todo: 打包压缩，离线资源包更新等，

Todo: 本地数据模型等

```js
/* Todo: 
  看看内存清理相关的（之前chrome-devtools 团队有视频讲
  reference garbage collect 
*/
{
  $destroy: function() {
    if(this.$$destroyed) return;
    var parent = this.$parent;

    this.$broadcast('$destroy');
    this.$$destroyed = true;
    if(this === $rootScope) return;

    // $listenerCount

    // update reference/parent's childHead,childTail and prevSibling/nextSibling relationship

    this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = noop;

    this.$on = this.$watch = this.$$watchGroup = function() {
      return noop;
    }
    this.$$listeners = {};

    // v8's memory leak vis optimized code
    // $parent, $$nextSibling, $root, $$watchers = null
  }
}
```


// prelink 和 postlink 的区别
// ionScroll 和 ionContent 的区别

