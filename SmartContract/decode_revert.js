#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');

// Your revert data
const revertData = process.argv[2] || '0x025dbdd4';

// Common error selectors
const COMMON_ERRORS = {
    '0x08c379a0': 'Error(string)',
    '0x4e487b71': 'Panic(uint256)',
    '0x095ea7b3': 'approve(address,uint256)',
    '0xa9059cbb': 'transfer(address,uint256)',
    '0x23b872dd': 'transferFrom(address,address,uint256)',
};

// Common panic codes
const PANIC_CODES = {
    0x01: 'Assertion failed',
    0x11: 'Arithmetic overflow/underflow', 
    0x12: 'Division by zero',
    0x21: 'Invalid enum value',
    0x22: 'Invalid storage byte array access',
    0x31: 'Pop from empty array',
    0x32: 'Array index out of bounds',
    0x41: 'Out of memory',
    0x51: 'Invalid function selector'
};

function decodeRevertData(data) {
    console.log('🔍 Decoding Revert Data');
    console.log('=' .repeat(50));
    console.log(`Input: ${data}`);
    console.log();

    if (!data.startsWith('0x')) {
        console.log('❌ Invalid format: Must start with 0x');
        return;
    }

    const selector = data.slice(0, 10);
    const params = data.slice(10);
    
    console.log(`Function Selector: ${selector}`);
    console.log(`Parameters: ${params || '(none)'}`);
    console.log();

    // Check common errors
    if (COMMON_ERRORS[selector]) {
        console.log(`✅ Known Error: ${COMMON_ERRORS[selector]}`);
        
        if (selector === '0x08c379a0' && params) {
            // Decode Error(string)
            try {
                const message = decodeErrorString(params);
                console.log(`📝 Message: "${message}"`);
            } catch (e) {
                console.log(`❌ Failed to decode message: ${e.message}`);
            }
        } else if (selector === '0x4e487b71' && params) {
            // Decode Panic(uint256)
            try {
                const code = parseInt(params.slice(-2), 16);
                const meaning = PANIC_CODES[code] || 'Unknown panic code';
                console.log(`⚠️  Panic Code: 0x${code.toString(16).padStart(2, '0')}`);
                console.log(`📖 Meaning: ${meaning}`);
            } catch (e) {
                console.log(`❌ Failed to decode panic: ${e.message}`);
            }
        }
    } else {
        console.log(`❓ Unknown Error Selector: ${selector}`);
        console.log();
        console.log('🔎 Checking 4byte.directory...');
        lookup4Byte(selector);
    }
}

function decodeErrorString(hexParams) {
    // Simple ABI decoding for string (this is a basic implementation)
    const buffer = Buffer.from(hexParams, 'hex');
    
    // Skip offset (32 bytes) and length (32 bytes), then read string
    if (buffer.length < 64) throw new Error('Invalid string encoding');
    
    const length = parseInt(buffer.slice(32, 64).toString('hex'), 16);
    const stringBytes = buffer.slice(64, 64 + length);
    
    return stringBytes.toString('utf8');
}

function lookup4Byte(selector) {
    const options = {
        hostname: 'www.4byte.directory',
        path: `/api/v1/signatures/?hex_signature=${selector}`,
        method: 'GET',
        headers: {
            'User-Agent': 'RevertDecoder/1.0'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (response.results && response.results.length > 0) {
                    console.log('✅ Found signatures:');
                    response.results.forEach((result, index) => {
                        console.log(`   ${index + 1}. ${result.text_signature}`);
                    });
                } else {
                    console.log('❌ No signatures found in 4byte.directory');
                    console.log();
                    console.log('💡 Suggestions:');
                    console.log('   • Check the contract source code on Etherscan');
                    console.log('   • Look for custom error definitions in the contract ABI');
                    console.log('   • This might be a custom error from a specific protocol');
                }
            } catch (e) {
                console.log('❌ Failed to parse 4byte.directory response');
            }
        });
    });

    req.on('error', (e) => {
        console.log('❌ Failed to lookup 4byte.directory (network error)');
        console.log();
        console.log('💡 Manual lookup: https://www.4byte.directory/signatures/?bytes4_signature=' + selector);
    });

    req.setTimeout(5000, () => {
        req.destroy();
        console.log('⏱️  4byte.directory lookup timed out');
    });

    req.end();
}

function generateErrorSelector(signature) {
    const hash = crypto.createHash('sha256').update(signature).digest('hex');
    return '0x' + hash.slice(0, 8);
}

function showHelp() {
    console.log('🔧 Ethereum Revert Data Decoder');
    console.log();
    console.log('Usage:');
    console.log('  node decode-revert.js <revert_data>');
    console.log();
    console.log('Examples:');
    console.log('  node decode-revert.js 0x025dbdd4');
    console.log('  node decode-revert.js 0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000114e6f7420656e6f7567682062616c616e6365000000000000000000000000000000');
    console.log();
    console.log('Features:');
    console.log('  • Identifies common error types (Error, Panic)');
    console.log('  • Decodes string error messages');  
    console.log('  • Looks up unknown selectors on 4byte.directory');
    console.log('  • Shows panic code meanings');
}

// Main execution
if (process.argv.length < 3 || process.argv[2] === '--help' || process.argv[2] === '-h') {
    showHelp();
} else {
    decodeRevertData(revertData);
}