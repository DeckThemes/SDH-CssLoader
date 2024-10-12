#!/bin/bash

# TODO: NOT FINISHED

# This uses macos' sed, which is different from the one in linux

css_file_path="$(dirname "$0")/src/styles/styles.css"
css_as_string_path="$(dirname "$0")/src/styles/styles-as-string.ts"

# Read the content of the CSS file, ignoring lines that start with '/*'
css_content=$(sed '/^\s*\/\*/d' "$css_file_path")

export_header_line_number=$(grep -n "export const styles" $css_as_string_path | cut -d: -f1)
echo export_header_line_number: $export_header_line_number