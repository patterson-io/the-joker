#!/bin/bash

# Test Feature Validation Script
# This script validates that the test files demonstrate the expected agent functionality

echo "🃏 Agent Test Suite Validator"
echo "=============================="
echo

# Test 1: Joker Agent Test
echo "📝 Testing Joker Agent functionality..."
if [ -f "tests/joker-test.md" ]; then
    echo "✅ joker-test.md exists"
    
    # Check if the file ends with a joke (has --- separator)
    if grep -q "^---$" tests/joker-test.md; then
        echo "✅ File contains joke separator (---)"
        
        # Check if there's content after the separator
        if tail -n +$(grep -n "^---$" tests/joker-test.md | tail -1 | cut -d: -f1) tests/joker-test.md | tail -n +2 | grep -q "."; then
            echo "✅ File contains joke content after separator"
        else
            echo "❌ No joke content found after separator"
        fi
    else
        echo "❌ No joke separator (---) found"
    fi
else
    echo "❌ joker-test.md not found"
fi

echo

# Test 2: JavaScript Pro Agent Test
echo "🚀 Testing JavaScript Pro Agent functionality..."
if [ -f "tests/javascript-pro-test.js" ]; then
    echo "✅ javascript-pro-test.js exists"
    
    # Check for modern JS features
    if grep -q "async/await\|class\|const\|=>" tests/javascript-pro-test.js; then
        echo "✅ Contains modern JavaScript features"
    else
        echo "❌ Missing modern JavaScript features"
    fi
    
    if grep -q "try.*catch\|Promise\|async.*function" tests/javascript-pro-test.js; then
        echo "✅ Contains async patterns and error handling"
    else
        echo "❌ Missing async patterns"
    fi
    
    if grep -q "export\|import" tests/javascript-pro-test.js; then
        echo "✅ Contains ES6 module syntax"
    else
        echo "❌ Missing module syntax"
    fi
else
    echo "❌ javascript-pro-test.js not found"
fi

echo

# Test 3: Spanish Agent Test
echo "🇪🇸 Testing Spanish Agent functionality..."
if [ -f "tests/spanish-agent-test.js" ]; then
    echo "✅ spanish-agent-test.js exists"
    
    # Check for Spanish identifiers
    if grep -q "obtener\|procesar\|configuracion\|datos" tests/spanish-agent-test.js; then
        echo "✅ Contains Spanish method names"
    else
        echo "❌ Missing Spanish method names"
    fi
    
    if grep -q "idUsuario\|datosUsuario\|correoElectronico" tests/spanish-agent-test.js; then
        echo "✅ Contains Spanish variable names"
    else
        echo "❌ Missing Spanish variable names"
    fi
    
    if grep -q "Error.*español\|mensaje.*español\|'.*español'" tests/spanish-agent-test.js; then
        echo "✅ Contains Spanish error messages"
    else
        echo "❌ Missing Spanish error messages"
    fi
else
    echo "❌ spanish-agent-test.js not found"
fi

echo
echo "🎯 Test Validation Complete!"
echo "=============================="

# Summary
echo "📊 Summary:"
echo "- Joker Agent: Tests joke addition to .md files"
echo "- JavaScript Pro: Tests modern JS patterns and async programming"
echo "- Spanish Agent: Tests Spanish naming conventions"
echo
echo "All test files are ready for validation of agent functionality."