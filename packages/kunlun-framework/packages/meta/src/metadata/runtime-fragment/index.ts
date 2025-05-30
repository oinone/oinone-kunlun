import {
  ServerAction,
  ServerActionFragmentName,
  SharedViewAction,
  SharedViewActionFragmentName,
  UrlAction,
  UrlActionFragmentName,
  ViewAction,
  ViewActionFragmentName
} from './action';
import { Function, FunctionFragmentName } from './function';
import { Model, ModelFragmentName } from './model';
import { Module, ModuleFragmentName } from './module';
import { View, ViewFragmentName } from './view';

export const MetadataRuntimeFragment = {
  Module,
  Model,
  ViewAction,
  SharedViewAction,
  ServerAction,
  UrlAction,
  View,
  Function
};

export const MetadataRuntimeFragmentName = {
  Module: ModuleFragmentName,
  Model: ModelFragmentName,
  ViewAction: ViewActionFragmentName,
  SharedViewAction: SharedViewActionFragmentName,
  ServerAction: ServerActionFragmentName,
  UrlAction: UrlActionFragmentName,
  View: ViewFragmentName,
  Function: FunctionFragmentName
};
