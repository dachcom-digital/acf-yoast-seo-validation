<?php
/*
Plugin Name: Dachcom ACF - YOAST SEO Validation
Plugin URI: https://github.com/dachcom-digital/acf-yoast-seo-validation.git
Description: Add a YOAST SEO (3+) Validation to ACF.
Version: 5.3.2.2
Author: Stefan Hagspiel
Author URI: http://www.dachcom.com
Copyright: DACHCOM.DIGITAL, Stefan Hagspiel
*/


Class AcfYoastSeoValidator {

    public function __construct() {

        add_action( 'admin_enqueue_scripts',  array($this, 'bind_js'));


    }

    public static function bind_js() {

        if (!defined('WPSEO_VERSION')) {
            return;
        }
        if (get_current_screen()->base !== 'post') {
            return;
        }
        wp_enqueue_script('acf_yoast_seo_validator', plugin_dir_url( __FILE__ ) . 'assets/js/acf_yoast.js', false, false, true);
    }
}

$cl = new AcfYoastSeoValidator();
