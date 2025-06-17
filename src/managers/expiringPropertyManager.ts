import ExpiringProperty from './expiringProperty';

class ExpiringPropertyManager {
  private static properties = new Set<ExpiringProperty<any>>();
  private static interval: NodeJS.Timeout = setInterval(() => {
    const expiredProperties = [...this.properties.values()].filter((prop) => prop.isExpired());

    expiredProperties.forEach((expiredProperty) => expiredProperty.clear());
  }, 1000);

  static register (prop: ExpiringProperty<any>) {
    this.properties.add(prop);
  }
}

export default ExpiringPropertyManager;
