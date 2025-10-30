<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <span class="text-xl font-bold text-indigo-600">PolkaLines</span>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <slot />
</div>
