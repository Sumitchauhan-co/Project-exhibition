"""Authentication module package.

Avoid importing the route module at package load time because the auth dependency
layer imports the service layer, which in turn imports billing. Doing that here
creates an import cycle during startup.
"""

__all__ = []
