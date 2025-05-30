import { interfaces } from 'inversify';
import { AutoFactory, Base, ClassFactory, Constructor, Factory, InjectionToken, Provide } from './register';
import {
  Autowired,
  Instantiate,
  InstantiatePostConstruct,
  Instantiates,
  PostConstruct,
  RawInstantiate,
  RawInstantiates,
  Service
} from './spring';

export class SPI {
  /**
   * generator spi storage
   */
  public static Base = Base;

  /**
   * register target to token storage
   */
  public static ClassFactory = ClassFactory;

  /**
   * register singleton service
   */
  public static Service = Service;

  /**
   * autowired service property/parameter in service
   */
  public static Autowired = Autowired;

  /**
   * service construct after execute method
   */
  public static PostConstruct = PostConstruct;

  /**
   * autowired service in widget
   */
  public static Instantiate = Instantiate;

  /**
   * autowired services in widget
   */
  public static Instantiates = Instantiates;

  /**
   * service construct after execute method in widget
   */
  public static InstantiatePostConstruct = InstantiatePostConstruct;

  /**
   * get an instantiate service of optimal
   */
  public static RawInstantiate = RawInstantiate;

  /**
   * get all instantiate services
   */
  public static RawInstantiates = RawInstantiates;

  /**
   * @param desc
   * @constructor
   * @deprecated since 5.0
   */
  public static Token<T>(desc: string) {
    return InjectionToken<T>(desc);
  }

  /**
   * @param desc
   * @constructor
   * @deprecated since 5.0
   */
  public static FactoryToken<T>(desc: string) {
    return InjectionToken<interfaces.Factory<T>>(desc);
  }

  /**
   * @param desc
   * @constructor
   * @deprecated since 5.0
   */
  public static ConstructorToken<T>(desc: string) {
    return InjectionToken<interfaces.Newable<T>>(desc);
  }

  /**
   * @deprecated since 5.0
   */
  public static Provide = Provide;

  /**
   * @deprecated since 5.0
   */
  public static AutoFactory = AutoFactory;

  /**
   * @deprecated since 5.0
   */
  public static Constructor = Constructor;

  /**
   * @deprecated since 5.0
   */
  public static Factory = Factory;
}

export * from './typing';
export * from './register/typing';
export * from './operator';
export { StorageKey as SPIStorageKey, Storage as SPIStorage } from './operator/storage';
export * from './selector';
export * from './utils';
