import { Action, ClientAction, ServerAction, UrlAction, ViewAction } from './action';
import { Field } from './field';
import { Func } from './func';
import { Menu } from './menu';
import { Model, ModelWithFields } from './model';
import { View } from './page';

export const MetadataFragment = {
  Model,
  ModelWithFields,
  Field,
  UrlAction,
  ServerAction,
  ViewAction,
  ClientAction,
  Action,
  Menu,
  View,
  Func
};
