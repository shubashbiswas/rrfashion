#!/bin/bash
# Fix Apache MPM conflict right before Apache starts
rm -f /etc/apache2/mods-enabled/mpm_event.conf /etc/apache2/mods-enabled/mpm_event.load 2>/dev/null || true

# Run the real apache2-foreground
exec apache2-foreground
