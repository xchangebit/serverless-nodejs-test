provider "aws" {
  profile    = "default"
  region     = "us-east-1"
}

resource "aws_s3_bucket" "log_bucket" {
  bucket = "yoti_logging"
  acl = "private"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "YOTI LOGS"
    Service     = "YOTI"
    Feature     = "LOGS"
    Environment = "Production"
  }
}

resource "aws_s3_bucket" "configuration" {
  bucket = "yoti_configuration"
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "YOTI CONFIGURATION"
    Service     = "YOTI"
    Feature     = "CONFIGURATION"
    Environment = "Production"
  }

  logging {
    target_bucket = "${aws_s3_bucket.log_bucket.id}"
    target_prefix = "log/"
  }
}

resource "aws_s3_bucket" "idv" {
  bucket = "yoti_idv"
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "YOTI IDV"
    Service     = "YOTI"
    Feature     = "IDV"
    Environment = "Production"
  }

  logging {
    target_bucket = "${aws_s3_bucket.log_bucket.id}"
    target_prefix = "log/"
  }
}
resource "aws_s3_bucket" "age" {
  bucket = "yoti_age"
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "YOTI AGE"
    Service     = "YOTI"
    Feature     = "AGE"
    Environment = "Production"
  }

  logging {
    target_bucket = "${aws_s3_bucket.log_bucket.id}"
    target_prefix = "log/"
  }
}