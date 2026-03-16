// activePet.js
let _lastActivePet = null;

export function setLastActivePet(petId, petName) {
    _lastActivePet = { petId, petName };
}

export function getLastActivePet() {
    return _lastActivePet;
}
