/**
 * @file
 */

// Set a temporary site_path, to get around initial settings checks.
nositepath_temp_path = 'http://example.org';
if (!Drupal.settings.site_path || Drupal.settings.site_path == '') {
  Drupal.settings.site_path = variable_get('nositepath_site_path', nositepath_temp_path);
}

/**
 * Implements hook_deviceready().
 */
function nositepath_deviceready() {
  try {
    // Get a URL from the user if no site_path has been set yet.
    if (Drupal.settings.site_path == nositepath_temp_path) {
      // As we're only part-way through hook_deviceready, it seems not to work
      // to redirect to the nositepath form here. Instead, we just prompt for
      // the URL.
      var site_path = window.prompt('Drupal URL:', nositepath_temp_path);
      nositepath_reconnect(site_path);
    }
  } catch (error) {
    console.log('nositepath_deviceready - ' + error);
  }
}

/**
 * Implements hook_menu().
 */
function nositepath_menu() {
  var items = {};
  items['nositepath'] = {
    title: 'Connect to Drupal',
    page_callback: 'drupalgap_get_form',
    page_arguments: ['nositepath_form'],
  };
  return items;
}

/**
 * Implements hook_form().
 */
function nositepath_form(form, form_state) {
  try {
    form.prefix = '<h2>Connect to Drupal</h2>';
    form.elements['site_path'] = {
      type: 'textfield',
      title: 'Address of a Drupal site:',
      default_value: Drupal.settings.site_path,
      required: true,
    };
    form.elements['submit'] = {
      type: 'submit',
      value: 'Connect',
    };
    return form;
  } catch (error) {
    console.log('nositepath_offline_form - ' + error);
  }
}

/**
 * Implements hook_form_submit().
 */
function nositepath_form_submit(form, form_state) {
  try {
    nositepath_reconnect(form_state.values['site_path'], nositepath_alert_success);
  } catch (error) {
    console.log('nositepath_offline_form_submit - ' + error);
  }
}

/**
 * Alert the user of the successful connnection.
 */
function nositepath_alert_success(message) {
  alert('Connection successful!');
}

/**
 * Connects to the given site path.
 *
 * @param site_path
 *   The full URI of the new site_path.
 * @param success_callback
 *   (optional) The function to call after a successful reconnection. Additional
 *   arguments passed to nositepath_reconnect() will be passed on to
 *   success_callback.
 */
function nositepath_reconnect(site_path, success_callback) {
  try {
    // Set the site_path variables, and save the persistent one.
    Drupal.settings.site_path = site_path;
    drupalgap.settings.site_path = site_path;
    if (success_callback !== undefined) {
      // Remove the function name and success_callback from the list of
      // arguments.
      var args = Array.prototype.slice.call(arguments).slice(2);
    }
    // Try to connect, and then bootstrap.
    return system_connect(
            {
              success: function () {
                if (success_callback !== undefined) {
                  success_callback.apply(this, args);
                }
                variable_set('nositepath_site_path', site_path);
                // Re-load. Does this work?
                drupalgap_onload();
                //drupalgap_bootstrap();
                //drupalgap_goto('');
              },
            }
    );
  } catch (error) {
    console.log('nositepath_reconnect - ' + error);
  }
}
