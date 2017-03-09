define(['utils'], function (Utils) {

  function render(selector, data) {
    var model = $$.isArray(data) ? {'data': data} : data;
    var template = $$('script' + selector);
    var templateStr = template.html();
    var parent = template.parent();
    var compiledTemplate = Template7.compile(templateStr);

    parent.append(compiledTemplate(model));
  }

  Template7.registerHelper('valueType', function (value) {
    return valueType(value);
  });

  function valueType(x) {
    x = parseFloat(x);
    var str = x.toLocaleString();
    return toFixedTwo(str);
  }

  function toFixedTwo(x) {
    var index = x.indexOf('.');
    if (index < 0) {
      index = x.length;
      x += '.';
    }

    while (x.length <= index + 2) {
      x += '0';
    }

    return x;
  }

  return {
    render: render
  };
});
