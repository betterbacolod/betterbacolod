#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yamlPath = path.join(__dirname, '../src/data/services.yaml');
const jsonPath = path.join(__dirname, '../src/data/services.json');

try {
  // Read the YAML file
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');

  // Parse YAML to JavaScript object
  const data = yaml.load(yamlContent);

  // Write as JSON with proper formatting
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  console.log('✅ Successfully converted services.yaml to services.json');
} catch (error) {
  console.error('❌ Error converting YAML to JSON:', error.message);
  process.exit(1);
}
