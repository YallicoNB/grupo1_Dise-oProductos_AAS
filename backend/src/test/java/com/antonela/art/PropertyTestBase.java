package com.antonela.art;

import net.jqwik.api.PropertyDefaults;

/**
 * Clase base abstracta para todos los property-based tests.
 * Configura tries=100 por defecto como establece el plan de pruebas.
 */
@PropertyDefaults(tries = 100)
public abstract class PropertyTestBase {
}
