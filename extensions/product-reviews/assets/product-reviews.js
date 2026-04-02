/**
 * Product Reviews Widget JavaScript
 * Handles interactive features for the product reviews app block
 */

(function() {
  'use strict';

  /**
   * Product Reviews Widget Class
   */
  class ProductReviewsWidget {
    constructor(config) {
      this.config = config || {};
      this.enabled = this.config.enabled !== false;
      this.init();
    }

    /**
     * Initialize the widget
     */
    init() {
      if (!this.enabled) {
        console.log('[ProductReviews] Widget disabled');
        return;
      }

      console.log('[ProductReviews] Initializing widget...');
      this.bindEvents();
      this.loadDynamicContent();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
      // Handle size chart toggle if present
      const sizeChartToggle = document.querySelector('[data-size-chart-toggle]');
      if (sizeChartToggle) {
        sizeChartToggle.addEventListener('click', (e) => this.handleSizeChartToggle(e));
      }

      // Handle author bio expand
      const authorBioExpand = document.querySelector('[data-author-bio-expand]');
      if (authorBioExpand) {
        authorBioExpand.addEventListener('click', (e) => this.handleAuthorBioExpand(e));
      }

      // Handle "Write a Review" buttons
      const reviewButtons = document.querySelectorAll('[data-write-review]');
      reviewButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => this.handleWriteReview(e));
      });

      console.log('[ProductReviews] Events bound');
    }

    /**
     * Load dynamic content via AJAX (if needed)
     */
    loadDynamicContent() {
      // This could fetch additional reviews from your app backend
      // For now, we're using metafields which are server-side rendered
      console.log('[ProductReviews] Dynamic content loaded');
    }

    /**
     * Handle size chart toggle click
     */
    handleSizeChartToggle(e) {
      e.preventDefault();
      const chartId = e.currentTarget.dataset.target;
      const chart = document.getElementById(chartId);
      
      if (chart) {
        chart.classList.toggle('hidden');
        e.currentTarget.textContent = chart.classList.contains('hidden') 
          ? 'Show Size Chart' 
          : 'Hide Size Chart';
      }
    }

    /**
     * Handle author bio expand
     */
    handleAuthorBioExpand(e) {
      e.preventDefault();
      const bio = e.currentTarget.previousElementSibling;
      
      if (bio) {
        bio.classList.toggle('expanded');
        e.currentTarget.textContent = bio.classList.contains('expanded')
          ? 'Show less'
          : 'Read more';
      }
    }

    /**
     * Handle write review button click
     */
    handleWriteReview(e) {
      e.preventDefault();
      const productId = e.currentTarget.dataset.productId;
      
      // This would open a review form modal
      // For now, just log the action
      console.log('[ProductReviews] Write review for product:', productId);
      
      // In a real implementation, you would:
      // 1. Open a modal with a review form
      // 2. Submit the review to your app backend
      // 3. Update the metafields via your app's API
      alert('Review form would open here. Product ID: ' + productId);
    }

    /**
     * Update rating display
     */
    updateRating(newRating, reviewCount) {
      const ratingEl = document.querySelector('.average-rating');
      if (!ratingEl) return;

      const fullStars = Math.floor(newRating);
      const hasHalfStar = newRating % 1 >= 0.5;
      
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          starsHtml += '★';
        } else if (i === fullStars + 1 && hasHalfStar) {
          starsHtml += '★';
        } else {
          starsHtml += '☆';
        }
      }

      ratingEl.innerHTML = `
        <span class="rating-stars">${starsHtml}</span>
        <span class="review-count">(${reviewCount} reviews)</span>
      `;
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function initWidget() {
    const config = window.ProductReviewsConfig || {};
    if (config.autoInit !== false) {
      window.productReviewsWidget = new ProductReviewsWidget(config);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Expose to global scope for manual initialization if needed
  window.ProductReviewsWidget = ProductReviewsWidget;
})();
