"""Generate the hero WebP from its original PNG; keep dimensions and transparency."""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parent.parent / "src" / "assets"
source = assets / "holmes-lying-hero.png"
target = assets / "holmes-lying-hero.generated.webp"

with Image.open(source) as original:
    original.convert("RGBA").save(target, "WEBP", quality=88, method=6,
                                  alpha_quality=100, exact=True)
    with Image.open(target) as optimized:
        if optimized.size != original.size:
            raise RuntimeError("Hero dimensions changed")
        optimized.load()
before, after = source.stat().st_size, target.stat().st_size
if after >= before:
    target.unlink(missing_ok=True)
    raise RuntimeError("WebP is not smaller than the original PNG")
print(f"Holmes hero: {before:,} -> {after:,} bytes ({100 * (1-after/before):.1f}% smaller)")

# The navigation logo is at most 200 CSS pixels wide; preserve 3x density.
logo_source = assets / "holmes-logo.webp"
logo_target = assets / "holmes-logo.generated.webp"
with Image.open(logo_source) as original:
    image = original.convert("RGBA")
    image.thumbnail((600, 600), Image.Resampling.LANCZOS)
    image.save(logo_target, "WEBP", quality=88, method=6, alpha_quality=100, exact=True)
if logo_target.stat().st_size >= logo_source.stat().st_size:
    logo_target.unlink(missing_ok=True)
    raise RuntimeError("Optimized logo is not smaller")
print(f"Navigation logo: {logo_source.stat().st_size:,} -> {logo_target.stat().st_size:,} bytes")
