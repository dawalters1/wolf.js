
class ExpiringPropertyManager {
  static properties = new Set();

  static interval = setInterval(() => {
    const expiredProperties = [...this.properties.values()].filter((prop) => prop.isExpired());

    expiredProperties.forEach((expiredProperty) => expiredProperty.clear());
  }, 1000);

  static register (prop) {
    this.properties.add(prop);
  }
}

export default ExpiringPropertyManager;
