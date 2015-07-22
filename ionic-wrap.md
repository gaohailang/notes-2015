# 看 gfopen/client 的代码

## 目录结构：
tree -I '*lib*|*resources*|*img*'
App/resources
weixin/lib/ionic
weixin/img

```bash
├── App
│   ├── bower.json
│   ├── config.xml // 配置icon/splash等， 配置author description, 配置项 preference 如 LogLevel, webviewbounce, UIWebViewBounce， DisallowOverscroll， BackupWebStorage, SplashScreenDelay 等
│   ├── gulpfile.js
│   ├── hooks
│   │   ├── README.md
│   │   └── after_prepare
│   │       └── 010_add_platform_class.js
│   ├── ionic.project
│   ├── package.json // 多了 cordovaPlugins 配置项，device, console, keyboard, file, file-transfer 等
│   └── scss
│       └── ionic.app.scss
├── build.sh
├── camera.sh
├── certification.sh
├── ci.sh
├── clean.sh
├── increase.sh
├── prepare.sh
├── upload.sh
├── video.sh
├── version.ini
├── project.config
├── ios
│   └── accountApp_dist.mobileprovision
├── plugin
│   └── run.sh
├── sign
│   ├── README
│   └── account-app-release-key.keystore
├── publish
│   ├── dev
│   │   └── link.png
│   ├── favicon.ico
│   ├── product
│   │   └── link.png
│   ├── style.css
│   └── template
│       ├── config.xml
│       ├── index.html
│       └── iphone.plist
└── weixin
    ├── README.md
    ├── css
    │   ├── index.css
    │   ├── ionicons.min.css
    │   └── style.css
    ├── js
    │   ├── app.js
    │   ├── config
    │   │   └── config.js
    │   ├── controller.js
    │   ├── controllers
    │   │   ├── accountController.js
    │   │   ├── accountPasswordController.js
    │   │   ├── auditResultController.js
    │   │   ├── bankController.js
    │   │   ├── comboController.js
    │   │   ├── homeController.js
    │   │   ├── identityCardController.js
    │   │   ├── identityInfoController.js
    │   │   ├── loginController.js
    │   │   ├── placeController.js
    │   │   ├── resultController.js
    │   │   ├── returnVisitController.js
    │   │   ├── riskController.js
    │   │   ├── riskResultController.js
    │   │   ├── serviceProductController.js
    │   │   ├── signController.js
    │   │   └── videoController.js
    │   ├── directives
    │   │   ├── headerDirective.js
    │   │   ├── popOverHeaderDirective.js
    │   │   └── resultFooter.js
    │   ├── directives.js
    │   ├── index.js
    │   ├── jquery.js
    │   ├── service.js
    │   ├── services
    │   │   └── postService.js
    │   ├── thirdParty
    │   │   └── elastic.js
    │   └── utils
    │       └── commonUtils.js
    ├── index.html
    ├── commonHeader.html
    ├── popOverHeader.html
    ├── resultFooter.html
    └── templates
        ├── account.html
        ├── auditResult.html
        ├── bank.html
        ├── combo.html
        ├── home.html
        ├── identityCard.html
        ├── identityInfo.html
        ├── login.html
        ├── password.html
        ├── place.html
        ├── result.html
        ├── returnVisit.html
        ├── risk.html
        ├── riskResult.html
        ├── serviceProduct.html
        ├── sign.html
        └── video.html
```

熟悉下 build 流程

ci.sh - 持续集成
首先运行 ./prepare.sh
接受命令行参数： dev/product
然后运行 build.sh, upload.sh, clean.sh
接着运行 ./increase.sh 
echo 出运行的时间

prepare.sh

```shell
rm -rf ./App/www
cd App && mkdir www && cd ..
cp -r ./weixin/* ./App/www/

rm ./publish/* (如html,apk,ipa,plist,zip)

git pull
```

build.sh

```shell
# 获取 version.ini，从 publish/template/config.xml copy一份到App/config.xml 中，然后 sed 处理下version_number (和App/www/index.html)

cd ./App

if [[$1 = 'dev']]; then
    ionic build android --debug || { echo "building android apk failed"; exit 1; }
    mv ./platforms/android/ant-build/MainActivity-debug-unaligned.apk   ../publish/android_$version.apk
else
    # do the same with --release argument

    jarsigner --verbose --signlg SHA1withRSA -digestalg SHA1 -storepass 20150501 --keystore <> ../publish/android_unsigned_$version.apk account_app
    zipalign -v 4 ../publish/android_unsigned_$version.apk ../publish/android_$version.apk
    rm ../publish/android_unsigned_$version.apk
fi

# do ios build

```

对于 upload.sh 流程

```shell

cd ./App/platforms
zip -r android.zip android
zip -r ios.zip ios
mv *zip ../../publish/
cd ../..

cd ./publish
if [[ $1 = 'dev' ]]; then
    ftp -u ftp://gfopen:gfopen2015@10.2.89.182/dev/container/ *apk
    # ipa, plist, *html, *css, *zip
else
    # folder is product
fi

```

对于 increase.sh (version bump up)

```shell
num=$(echo "$version" | awk '{split($0,a,".")};print a[3]+1')
newVar="0.0.$num"
echo "next version: $newVer"
sed -i "" "s/$version/$newVer/g" ./version.ini
```

三个相关插件：
camera.sh, certification.sh, video.sh




执行反馈：

```
No platforms added to this project. Please use `cordova platform add <platform>`.
ERROR: Unable to build app on platform android. Please see console for more info.
Exiting.

-> 
cordova platform add android
cordova platform add ios

-->
Current working directory is not a Cordova-based project

cd APP/ 中，然后在执行

```
