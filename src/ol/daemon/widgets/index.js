import Widget from './Widget';
import SelectWidget from './Select';
import HighlightWidget from './Highlight';
import { EnumWidgets } from './types';

export { Widget, SelectWidget, HighlightWidget };

let widgets = {};

/**
 * Create widgets from map config
 * @param {Array<import('./Widget').WidgetConfig>} widgetsConfig
 */
export const createWidgets = widgetsConfig => {
  widgets = {};
  for (let i = 0; i < widgetsConfig.length; i++) {
    createWidget(widgetsConfig[i]);
  }
};

/**
 * Get a widget by it's name
 * @param {EnumWidgets} name
 * @return {Widget|undefined}
 */
export const getWidget = name => {
  return widgets[name];
};

/**
 * Create a new widget and return it. If a widget with the same name
 * exists an exception will be thrown.
 * @param {import('./Widget').WidgetConfig} config
 * @return {Widget}
 */
export const createWidget = config => {
  const name = config.name;
  if (widgets[name]) {
    throw `Widget with name ${name} already exists!`;
  }
  widgets[name] = widgetsFactory(config);
  return widgets[name];
};

/**
 * Creates a new widget
 * @param {import('./Widget').WidgetConfig} widgetConfig
 * @return {Widget}
 */
const widgetsFactory = widgetConfig => {
  switch (widgetConfig.name) {
    case EnumWidgets.SELECT:
      return new SelectWidget(widgetConfig);
    case EnumWidgets.HIGHLIGHT:
      return new HighlightWidget(widgetConfig);
  }
};
