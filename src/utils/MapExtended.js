import patch from './patch';

class MapExtended extends Map {
  get (key) {
    return Array.isArray(key)
      ? key.map((key) => super.get(key))
      : super.get(key);
  }

  set (key, value) {
    const existing = super.get(key);

    super.set(key,
      existing
        ? patch(existing, value)
        : value
    );

    return existing || value;
  }

  has (key) {
    return Array.isArray(key)
      ? key.map((key) => super.has(key))
      : super.has(key);
  }

  delete (key) {
    return Array.isArray(key)
      ? key.map((key) => super.delete(key))
      : super.delete(key);
  }
}

export default MapExtended;
