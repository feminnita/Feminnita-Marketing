ALTER TABLE `portal_materials`
  ADD COLUMN `subcategory` varchar(255),
  MODIFY COLUMN `category` enum('fotos','videos','banners','copy','lookbook','calculadora','links','treinamento') NOT NULL;
