/*
"url": "git://github.com/marmelab/ng-admin.git"
*/


ng-admin in angular way

对于 dashboard html：
.row.dashboard-content
    .col-lg-6
        .panel.panel-default[ng-repeat="panel in dashboardConroller.pannels" ng-if="$even"]
            ma-dashboard-panel
                [label="{{panel.label}}"]
                [view-name="{{panel.viewName}}"]
                [fields="panel.fields"
                entries="panel.entries"
                entity="panel.entity"
                per-page="panel.perPage"
                sort-field="panel.sortField"
                sort-dir="panel.sortDirt"]
    .col-lg-6
        .panel[ng-if="$odd"]

function DashboardController($scope, $location, PanelBuilder) {
    // bind to controller($location, $scope, etc)

    this.$scope.edit = this.edit.bind(this);
    this.retrievePanels();

    // undefine variable in controller
    $scope.$on('$destroy', this.destroy.bind(this));
}

DashboardConroller.prototype.edit = function(entry) {
    this.$location.path(entry.entityName + '/edit/'+entry.identifierValue);
};

DashboardConroller.prototype.retrievePanels = function() {
    var self = this;
    this.panels = [];
    this.PanelBuilder.getPanelData().then(function(panels) {
        self.panels = panels;
    })
};

PanelBuilder
看着有点头疼有些是工厂还是单例~
PanelBuilder.prototype.getPanelData = function() {
    var dashboardViews = this.Configuration.
        getViewsOfType('DashboardView'),
        dataSource = this.dataSource,
        promises = [],
        dashboardView,
        self = this,
        i;
    for(i in dashboardViews) {
        dashboardView = dashboardViews[i];
        promises.push(self.RetrieveQueries.getAll(
            dashboardView, 1, {},
            dashboardView.getSortFieldName(),
            dashboardView.sortDir()
        ));
    }

    return this.$q.all(promises).then(function(responses) {
        var i,
            response,
            view,
            entity,
            fields,
            panels = [];

        for(i in responses) {
            response = responses[i];
            view = dashboardViews[i];
            entity = view.getEntity();
            fields = view.fields();

            panels.push({
                label: view.title() || view.getEntity().label(),
                viewName: view.name(),
                fields: fields,
                entity: entity,
                perPage: view.perPage(),
                entries: dataStore.mapEntries(entity.name(), entity.identifier(), fields, response.data),
                sortField: view.getSortFieldName(),
                sortDir: view.sortDir()
            });
        }

        return panels;
    })
}

RetrieveQueries：
RetrieveQueries.prototype.getAll = function(view, page, fitlers, sortField, sortDir) {
    page = page || 1;
    var url = view.getUrl();

    return this.getRawValues(view.getEntity(), view.name(), view.type, page, view.perPage(), filters, view.fitlers(), sortField, sortDir, url).then(function(values) {
        return {
            data: values.data,
            totalItems: values.totalCount || values.headers.headers('X-Total-Count'||values.data.length)
        };
    });
};

RetrieveQueries.prototype.getRawValues = function() {

    // at last
    return this.Restangular.allUrl(entity.name(), this.config.getRouteFor(entity, url, viewType))
        .getList(params);
}

Configuration, AdminDescription:

Configuration：
main/provider/NgAdminConfiguration
es6/Factory
依赖于 AdminDescription
field, entity, menu, registerFieldType, application, 等

es6/lib/Factory
class Factory {
    constructor() {
        this._fieldTypes = [];
        this._init();
    }

    application(name, baseApiUri) {
        return new Appliction(name, baseApiUri);
    }

    field(name, type) {
        type = type || 'string';
        if(!type in this._fieldTypes) {
            throw new Error(`Unknown field type "{type}"`);
        }
        return new this._fieldTypes[type](name);
    }

    registerField(name, constructor) {
        this._fieldTypes[name] = constructor;
    }

    menu(entity) {
        let menu = new Menu();
        if(entity) {
            menu.populateFromEntity(entity);
        }
        return menu;
    }

    _init() {
        // registerFieldType
    }
}

es6/lib/Appliction
class Appliction {
    constructor(title='ng-admin', debug=true) {
        // baseApiUrl, customTemplate, title, menu, layout, header, entities, errorMessage, debug
    }

    get entities() {
        return this._entities;
    }

    getViewsType(type) {
        return orderElement.order(
            this.entities.map(map => entry.views[type]).fitler(view => view.enabled)
        );
    }
}



外围：
AppController



CrudModule:
ListController, ShowController, FormController, DeleteController, BatchDeleteController

包括的services:
EntryFormatter, PromisesResolver, RetrieveQueries, CreateQueries, UpdateQueries, DeleteQuries
FieldViewConfiguration

包括的指令：
(actions, button, column, field, [datagrid, pagintion, datagriditemselector, mafilter等])


如何配置和使用 ng-admin

配置 RestangularProvider
RestangularProvider.addFullRequestInterceptor(function(
    element, operation, what, url, headers, params
) {
    if(operation === 'getList') {
        if(params._page) {
            params._start = (params._page - 1) * params._perPage;
            params._end = params._page * params._perPage;
        }
        delete params._page;
        delete params._perPage;

        if(params._sortField) {
            params._sort = params._sortField;
            delete params._sortField;
        }
        if(params._sortDir) {
            params._order = params._sortDir;
            delete params._sortDir;
        }
        if(params._filters) {
            for(var filter in params._filters) {
                params[filter] = params._filters[filter];
            }
            delete params._filters;
        }
    }

    return {
        params: params
    }
});

var admin = nga.application('ng-admin backend demo');

var post = nga.entity('posts');

var comment = nga.entity('comments')
    .baseApiUri('http://localhost:3000/')
    .identifier(nga.field('id'));

var tag = nga.entity('tags').readOnly();
// disabled creation, edition, and deletion views

admin.addEntity(post).addEntity(comment).addEntity(tag);

post.dashboardView();

post.listView()
    .title('All posts')
    .description('List of posts with infinite pagination')
    .infinitePagination(true)
    .fields([
        nga.field('id').label('id'),
        nga.field('title'),
        nga.field('published_at', 'date'),
        nga.field('views', 'number'),
        nga.field('tags', 'reference_many')
            .targetEntity(tag)
            .targetField(nga.field('name'))
    ])
    .listAction(['show', 'edit', 'delete']);

post.creationView().fields([
    nga.field(title).attributes({
        placeholder: 'the post title'
    }).validation({
        required: true,
        minlength: 3,
        maxlength: 100
    }),
    nga.field('teaser', 'text'),
    nga.field('body', 'wysiwyg'),
    nga.field('published_at', 'date')
])

post.editionView()
    .title('Edit post "{{entry.values.title}}"')
    .actions(['list', 'show', 'delete'])
    .fields([
        post.creationView.fields(),
        nga.field('category', 'choice')
            .choices([
                {label: 'Tech', value: 'tech'},
                {label: 'Lifestyle', value: 'lifestyle'}
            ]),
        nga.field('subcategory', 'choice')
            .choices(function(entry) {
                return subCategories.filter(function(c) {
                    return c.category === entry.values.category;
                })
            });
        nga.field('tags', 'reference_many')
            .targetEntity(tag)
            .targetField.field('name')
            .classClasses('col-sm-4'),
        nga.field('picture', 'json'),
        nga.field('views', 'number').addClass('col-sm-4'),
        nga.field('comments', 'referenced_list')
            .targetEntity(comment)
            .targetReferenceField('post_id')
            .targetFields([
                nga.field('id'),
                nga.field('body').label('Comment')
            ]),
        nga.field('', 'template').label('').template('<span class="pull-right"><ma-filtered-list-button entity-name="comments" filter="{post_id: entry.values.id}" size="sm"></ma-filtered-list-button></span>')
    ]);

post.showView()
    .fields([
        nga.field('id'),
        nga.editionView().fields(),
        nga.field('custom-action', 'template').label('').template('<send-email post="entry"></send-email>')
    ]);

comment.creationView()
    .fields([
        nga.field('created_at', 'date').label('Posted')
            .defaultValue(new Date()),
        nga.field('author'),
        nga.field('body', 'wysiwyg'),
        nga.field('post_id', 'reference')
            .label('Post')
            .map(truncate)
            .targetEntity(post)
            .targetField(nga.field('title'))
            .validation({required: true})
    ])

comment.editionView()
    .fields(comment.creationView().fields())
    .fields([
        nga.field(null, 'template')
            .label('')
            .template('<post-link entry="entry"></post-link>')
    ])


comment.deletionView().title('Deletion confirmation');

var customHeaderTemplate = '';

admin.menu(nag.menu()
    .addChild(nga.menu(post).icon()),
    .addChild(nga.menu(comment).icon())
    .addChild(nga.menu().title('Other')
        .addChild(nga.menu().title('Stats').icon('').link('/stats'))
    )
)

nga.configure(admin);

app.directive('postLink', ['$location', function($location) {
    return {
        restrict: 'E',
        scope: {
            entry: '&'
        },
        template: '<p class="form-control-static"><a ng-click="displayPost()">View&nbsp;post</a></p>',
        link: function(scope) {
            scope.displayPost = function() {
                $location.path('/posts/show' + scope.entry().values.post_id);
            };
        }
    };
}])


/*
scope.send = function(scope) {
    scope.send = $location.path('/sendPost/'+scope.post().values.id);
}
*/

app.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('send-post', {
        parent: 'main',
        url: '/sendPost/:id',
        params: {id: null},
        controller: sendPostController,
        controllerAs: 'controller',
        template: sendPostControllerTemplate
    })
}])


// Adding custom field type
目前还有包括了默认的 string, 还有：
text, wysiwyg, number, data, datetime, boolean, email, password,
file, json,
choice, choices, reference_many, referenced_list,
template

a date field renders as a formatted  date in the listView, and as datepicker widget in the editionView;

usage:
nga.field('birth_date', 'date').format('small');
nga.registerField('date', '');

import Field from "./Field";
class DateField extends Field {
    constructor(name) {
        super(name);
        this._format = 'yyyy-MM-dd';
        this._parse = function(date) {
            if(date instanceof Date) {
                date.setMinutes(date.getMinute() - date.getTimezoneOffset());
                var dateString = date.toJSON();
                return dateString ? dateString.substr(0, 10): null;
            }
        };
        this._type = "date";
    }

    format(value) {
        if(!arguments.length) return this._format;
        this._format = value;
        return this;
    }

    parse(value) {
        if(!arguments.length) return this._parse;
        this._parse = value;
        return this;
    }
}

FieldViewConfigurationProvider.registerFieldView('date', {
    getReadWidget: function() {
        return '<ma-date-column field="::field" value="::entry.values[field.name()]"></ma-date-column>';
    },
    // getLinkWidget(displayed in listView and showView when isDetailLinked is true)
    // getFieldWidget(displayed in the filter form in the listVIew)
    getWriteWidget: function() {
        return '<div class="row"><ma-date-field field="::field" value="entry.values[field.name()]" class="col-sm-4"></ma-date-field>';
    }
});

// Crud 中的 fieldView 是用来注册到 nga 中的，决定在不同模式中，field的展示用什么template
具体的在 column folder/ field folder 中又具体的directive 定义的代码

// maWysiwygColumn.js
{
    link: function(scope) {
        var value = scope.value();
        if (scope.field().stripTags()) {
            value = $filter('stripTags')(value);
        }
        scope.htmlValue = value;
    },
    template: '<span ng-bind-html="htmlValue"></span>'
}

// maDateColumn.js
{
    scope: {
        value: '&',
        field: '&'
    },
    template: '<span>{{ value() | date:field().format() }}</span>'
}

// maDateField.js
{
    link: function(scope, element) {
        var field = scope.field();
        scope.name = field.name();
        scope.rawValue = scope.value;
        scope.$watch('rawValue', function() {
            scope.value = field.parse()(rawValue);
        });
        scope.format = field.format();
        scope.v = field.validation();
        scope.isOpen = false;
        for(var name in field.attributes()) {
            element.find('input').eq(0).attr(name, field.attributes[name]);
        }
        scope.toggleDatePicker = function($event])
    }
}

// es6/lib/Field/Field.js
class Field {
    constructor(name) {
        // type, order, laebl, maps, validation, cssClasses, detailLinkRoute
    }
    // 方法定义： label, map, cssClasses, validation
    validation(validation) {
        if(!arguments.length) {
            return this._validation;
        }
        for(var property in validation) {
            if(!validation.hasOwnProperty(property)) continue;
            if(validation[property] === null) {
                delete this._validation[property];
            } else {
                this._validation[property] = validation[property];
            }
        }
        return this; // chianable
    }
}
